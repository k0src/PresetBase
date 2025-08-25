import TableSelector from "../TableSelector/TableSelector";
import ManageDbFilter from "../ManageDbFilter/ManageDbFilter";
import ManageDbSortSelector from "../ManageDbSortSelector/ManageDbSortSelector";
import CSVDownloader from "../CSVDownloader/CSVDownloader";

import styles from "./ManageDbHeader.module.css";

export default function ManageDbHeader({
  entryType,
  totalEntries,
  onFilterChange,
  sortOptions,
  onSortSelectChange,
  sortBy,
  sortDirection,
  selectedTable,
  onTableChange,
  filterText,
}) {
  return (
    <section className={styles.header}>
      <div className={styles.headerTop}>
        <h1 className={styles.headingPrimary}>Manage Database</h1>
        <span className={styles.totalEntries}>
          {totalEntries ? totalEntries : "…"} {entryType}
        </span>
      </div>

      <div className={styles.headerBottomContainer}>
        <div className={styles.headerBottomTop}>
          <TableSelector
            selectedTable={selectedTable}
            onTableChange={onTableChange}
          />
          <CSVDownloader entryType={entryType} />
        </div>

        <div className={styles.headerBottom}>
          <ManageDbFilter
            placeholder={`Filter ${entryType}...`}
            onFilterChange={onFilterChange}
            value={filterText}
          />

          <ManageDbSortSelector
            sortOptions={sortOptions}
            onSortSelectChange={onSortSelectChange}
            sortBy={sortBy}
            sortDirection={sortDirection}
          />
        </div>
      </div>
    </section>
  );
}
