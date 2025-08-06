import BrowseHeader from "../BrowseHeader/BrowseHeader";
import BrowseTableView from "../BrowseTableView/BrowseTableView";

export default function BrowseResults({
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
}
