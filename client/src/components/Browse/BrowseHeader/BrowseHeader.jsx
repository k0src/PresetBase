import { memo, useMemo } from "react";
import BrowseFilter from "../BrowseFilter/BrowseFilter";
import BrowseSortSelect from "../BrowseSortSelect/BrowseSortSelect";

import styles from "./BrowseHeader.module.css";

const BrowseHeader = memo(function BrowseHeader({
  entryType,
  totalEntries,
  filterPlaceholder,
  onFilterChange,
  sortOptions,
  onSortSelectChange,
  sortBy,
  sortDirection,
}) {
  const entryTitle = useMemo(
    () => entryType.charAt(0).toUpperCase() + entryType.slice(1),
    [entryType]
  );

  return (
    <section className={styles.browseHeader}>
      <div className={styles.browseHeaderTop}>
        <h1 className={styles.headingPrimary}>All {entryTitle}</h1>
        <span className={styles.resultsCount}>{totalEntries} songs</span>
      </div>

      <div className={styles.browseHeaderBottom}>
        <div className={styles.filterContainer}>
          <BrowseFilter
            placeholder={filterPlaceholder}
            onFilterChange={onFilterChange}
          />
        </div>
        <BrowseSortSelect
          sortOptions={sortOptions}
          onSortSelectChange={onSortSelectChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
      </div>
    </section>
  );
});

export default BrowseHeader;
