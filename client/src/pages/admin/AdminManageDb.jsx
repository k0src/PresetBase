import { dbEntryConfigs } from "../../components/Admin/ManageDb/dbEntryConfigs";
import { useAdminTableData } from "../../hooks/useAdminTableData";
import { SlideoutProvider } from "../../contexts/SlideoutContext";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../components/ContentContainer/ContentContainer";
import ComponentLoader from "../../components/ComponentLoader/ComponentLoader";
import DbError from "../../components/DbError/DbError";
import ManageDbNoEntries from "../../components/Admin/ManageDb/ManageDbNoEntries/ManageDbNoEntries";
import ManageDbHeader from "../../components/Admin/ManageDb/ManageDbHeader/ManageDbHeader";
import EntryTable from "../../components/Admin/ManageDb/EntryTable/EntryTable";
import AdminSlideout from "../../components/Admin/ManageDb/Slideout/AdminSlideout/AdminSlideout";

const validTables = [
  "songs",
  "artists",
  "albums",
  "synths",
  "presets",
  "genres",
];

export default function AdminManageDb() {
  const { table } = useParams();
  const navigate = useNavigate();

  const currentTable = validTables.includes(table) ? table : "songs";

  const [sortBy, setSortBy] = useState("added");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [urlTable, setUrlTable] = useState(currentTable);

  useEffect(() => {
    if (currentTable !== urlTable) {
      setUrlTable(currentTable);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTable]);

  useEffect(() => {
    setSortBy("added");
    setSortDirection("asc");
    setFilterText("");
  }, [currentTable]);

  const { tableData, totalEntries, loading, error } = useAdminTableData(
    currentTable,
    sortBy,
    sortDirection,
    refreshKey
  );

  const handleRefreshData = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const currentConfig = useMemo(
    () => dbEntryConfigs[currentTable],
    [currentTable]
  );

  const pageTitle = useMemo(() => {
    const tableName =
      currentTable.charAt(0).toUpperCase() + currentTable.slice(1);
    return `Manage Database - ${tableName}`;
  }, [currentTable]);

  const handleTableChange = useCallback(
    (newTable) => {
      if (newTable === urlTable) return;
      setUrlTable(newTable);
      navigate(`/admin/manage-db/${newTable}`, { replace: false });
    },
    [navigate, urlTable]
  );

  const handleSortChange = useCallback((sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterText(filter);
  }, []);

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
    <SlideoutProvider>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <ManageDbHeader
          entryType={currentTable}
          totalEntries={totalEntries}
          sortOptions={currentConfig.sortOptions}
          onFilterChange={handleFilterChange}
          onSortSelectChange={handleSortChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
          selectedTable={urlTable}
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

      {hasData && !loading && (
        <AdminSlideout
          onUpdate={handleRefreshData}
          onDelete={handleRefreshData}
        />
      )}
    </SlideoutProvider>
  );
}
