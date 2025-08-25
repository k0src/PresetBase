import { dbEntryConfigs } from "../../components/Admin/ManageDb/dbEntryConfigs";
import { useAdminTableData } from "../../hooks/useAdminTableData";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../components/ContentContainer/ContentContainer";
import ComponentLoader from "../../components/ComponentLoader/ComponentLoader";
import DbError from "../../components/DbError/DbError";
import ManageDbNoEntries from "../../components/Admin/ManageDb/ManageDbNoEntries/ManageDbNoEntries";
import ManageDbHeader from "../../components/Admin/ManageDb/ManageDbHeader/ManageDbHeader";
import EntryTable from "../../components/Admin/ManageDb/EntryTable/EntryTable";

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
    sortDirection
  );

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

  if (loading) {
    return (
      <>
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

          <ComponentLoader />
        </ContentContainer>
      </>
    );
  }

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

  // No results view
  if (!tableData || !tableData.length) {
    return (
      <>
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

          <ManageDbNoEntries entryType={currentTable} />
        </ContentContainer>
      </>
    );
  }

  return (
    <>
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

        <EntryTable
          data={tableData}
          config={currentConfig}
          filterText={filterText}
        />
      </ContentContainer>
    </>
  );
}
