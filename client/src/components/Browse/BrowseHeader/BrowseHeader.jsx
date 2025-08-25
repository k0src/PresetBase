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
  let entryTitle = useMemo(
    () => entryType.charAt(0).toUpperCase() + entryType.slice(1),
    [entryType]
  );

  if (
    entryType !== "hot" &&
    entryType !== "popular" &&
    entryType !== "recent"
  ) {
    entryTitle = "All " + entryTitle;
  } else {
    entryTitle = entryTitle + " Songs";
  }

  return (
    <section className={styles.browseHeader}>
      <div className={styles.browseHeaderTop}>
        <h1 className={styles.headingPrimary}>{entryTitle}</h1>
        {totalEntries && (
          <span className={styles.resultsCount}>
            {totalEntries} {entryType}
          </span>
        )}
      </div>

      <div className={styles.browseHeaderBottom}>
        <BrowseFilter
          placeholder={filterPlaceholder}
          onFilterChange={onFilterChange}
        />

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
