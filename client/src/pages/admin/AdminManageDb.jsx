import { dbEntryConfigs } from "../../components/Admin/ManageDb/dbEntryConfigs";
import { useAdminTableData } from "../../hooks/useAdminTableData";
import { SlideoutProvider, useSlideout } from "../../contexts/SlideoutContext";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../components/ContentContainer/ContentContainer";
import ComponentLoader from "../../components/ComponentLoader/ComponentLoader";
import DbError from "../../components/DbError/DbError";
import ManageDbNoEntries from "../../components/Admin/ManageDb/ManageDbNoEntries/ManageDbNoEntries";
import ManageDbHeader from "../../components/Admin/ManageDb/ManageDbHeader/ManageDbHeader";
import EntryTable from "../../components/Admin/ManageDb/EntryTable/EntryTable";
import AdminSlideout from "../../components/Admin/ManageDb/Slideout/AdminSlideout/AdminSlideout";

const validTables = ["songs", "artists", "albums", "synths", "presets"];

function AdminManageDbContent() {
  const { table } = useParams();
  const navigate = useNavigate();
  const { isOpen, madeChanges } = useSlideout();

  const currentTable = validTables.includes(table) ? table : "songs";

  const [sortBy, setSortBy] = useState("added");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    setSortBy("added");
    setSortDirection("asc");
    setFilterText("");
  }, [currentTable]);

  const { tableData, totalEntries, loading, error, refreshTableData } =
    useAdminTableData(currentTable, sortBy, sortDirection);

  const currentConfig = useMemo(
    () => dbEntryConfigs[currentTable],
    [currentTable]
  );

  const pageTitle = useMemo(() => {
    const tableName =
      currentTable.charAt(0).toUpperCase() + currentTable.slice(1);
    return `Manage Database - ${tableName}`;
  }, [currentTable]);

  const handleSlideoutDelete = useCallback(() => {
    refreshTableData();
  }, [refreshTableData]);

  const handleTableChange = useCallback(
    (newTable) => {
      if (newTable === currentTable) return;
      navigate(`/admin/manage-db/${newTable}`, { replace: false });
    },
    [navigate, currentTable]
  );

  const handleSortChange = useCallback((sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterText(filter);
  }, []);

  const prevIsOpenRef = useRef(isOpen);
  const prevMadeChangesRef = useRef(madeChanges);

  useEffect(() => {
    if (prevIsOpenRef.current && !isOpen && prevMadeChangesRef.current) {
      refreshTableData();
    }
    prevIsOpenRef.current = isOpen;
    prevMadeChangesRef.current = madeChanges;
  }, [isOpen, madeChanges, refreshTableData]);

  if (error) {
    return (
      <>
        <Helmet>
          <title>Internal Server Error</title>
        </Helmet>
        <DbError errorMessage={error.message} />
      </>
    );
  }

  const hasData = tableData && tableData.length;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <ContentContainer>
        <ManageDbHeader
          entryType={currentTable}
          totalEntries={totalEntries}
          sortOptions={currentConfig.sortOptions}
          onFilterChange={handleFilterChange}
          onSortSelectChange={handleSortChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
          selectedTable={currentTable}
          onTableChange={handleTableChange}
          filterText={filterText}
        />

        {loading ? (
          <ComponentLoader />
        ) : !hasData ? (
          <ManageDbNoEntries entryType={currentTable} />
        ) : (
          <EntryTable
            data={tableData}
            config={currentConfig}
            filterText={filterText}
            entryType={currentTable}
          />
        )}
      </ContentContainer>

      {hasData && !loading && <AdminSlideout onDelete={handleSlideoutDelete} />}
    </>
  );
}

export default function AdminManageDb() {
  return (
    <SlideoutProvider>
      <AdminManageDbContent />
    </SlideoutProvider>
  );
}
