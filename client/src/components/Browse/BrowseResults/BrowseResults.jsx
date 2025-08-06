import { memo } from "react";
import BrowseHeader from "../BrowseHeader/BrowseHeader";
import BrowseTableView from "../BrowseTableView/BrowseTableView";

const BrowseResults = memo(function BrowseResults({
  entryType,
  data,
  totalEntries,
  config,
  onSortChange,
  onFilterChange,
  sortBy,
  sortDirection,
  filterText,
}) {
  return (
    <>
      <BrowseHeader
        entryType="songs"
        totalEntries={totalEntries}
        filterPlaceholder="Filter songs..."
        sortOptions={config.sortOptions}
        onFilterChange={onFilterChange}
        onSortSelectChange={onSortChange}
        sortBy={sortBy}
        sortDirection={sortDirection}
      />

      <BrowseTableView
        data={data}
        entryType={entryType}
        config={config}
        filterText={filterText}
      />
    </>
  );
});

export default BrowseResults;
