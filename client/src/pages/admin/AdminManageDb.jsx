import { dbEntryConfigs } from "../../components/Admin/ManageDb/dbEntryConfigs";
import { useAdminTableData } from "../../hooks/useAdminTableData";

import { useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../components/ContentContainer/ContentContainer";
import ComponentLoader from "../../components/ComponentLoader/ComponentLoader";
import DbError from "../../components/DbError/DbError";
import ManageDbNoEntries from "../../components/Admin/ManageDb/ManageDbNoEntries/ManageDbNoEntries";
import ManageDbHeader from "../../components/Admin/ManageDb/ManageDbHeader/ManageDbHeader";
import EntryTable from "../../components/Admin/ManageDb/EntryTable/EntryTable";

export default function AdminManageDb() {
  const [selectedTable, setSelectedTable] = useState("songs");
  const [sortBy, setSortBy] = useState("added");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");

  const { tableData, totalEntries, loading, error } = useAdminTableData(
    selectedTable,
    sortBy,
    sortDirection
  );

  const currentConfig = useMemo(
    () => dbEntryConfigs[selectedTable],
    [selectedTable]
  );

  const handleTableChange = useCallback((newTable) => {
    setSelectedTable(newTable);
    setSortBy("added");
    setSortDirection("asc");
    setFilterText("");
  }, []);

  const handleSortChange = useCallback((sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterText(filter);
  }, []);

  if (loading)
    return (
      <>
        <Helmet>
          <title>Manage Database</title>
        </Helmet>

        <ContentContainer isAuth={true} userIsAdmin={true}>
          <ManageDbHeader
            entryType={selectedTable}
            totalEntries={totalEntries}
            sortOptions={currentConfig.sortOptions}
            onFilterChange={handleFilterChange}
            onSortSelectChange={handleSortChange}
            sortBy={sortBy}
            sortDirection={sortDirection}
            selectedTable={selectedTable}
            onTableChange={handleTableChange}
            filterText={filterText}
          />

          <ComponentLoader />
        </ContentContainer>
      </>
    );

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

  // No results
  if (!tableData || !tableData.length) {
    return (
      <>
        <Helmet>
          <title>Manage Database</title>
        </Helmet>

        <ContentContainer isAuth={true} userIsAdmin={true}>
          <ManageDbHeader
            entryType={selectedTable}
            totalEntries={totalEntries}
            sortOptions={currentConfig.sortOptions}
            onFilterChange={handleFilterChange}
            onSortSelectChange={handleSortChange}
            sortBy={sortBy}
            sortDirection={sortDirection}
            selectedTable={selectedTable}
            onTableChange={handleTableChange}
            filterText={filterText}
          />

          <ManageDbNoEntries entryType={selectedTable} />
        </ContentContainer>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage Database</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <ManageDbHeader
          entryType={selectedTable}
          totalEntries={totalEntries}
          sortOptions={currentConfig.sortOptions}
          onFilterChange={handleFilterChange}
          onSortSelectChange={handleSortChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
          selectedTable={selectedTable}
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
