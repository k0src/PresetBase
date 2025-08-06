import { memo, useCallback } from "react";
import styles from "./BrowseSortSelect.module.css";
import { FaSort } from "react-icons/fa6";

const BrowseSortSelect = memo(function BrowseSortSelect({
  sortOptions,
  onSortSelectChange,
  sortBy,
  sortDirection,
}) {
  const handleSortSelectChange = useCallback(
    (e) => {
      const newSort = e.target.value;
      if (onSortSelectChange) {
        onSortSelectChange(newSort, sortDirection);
      }
    },
    [onSortSelectChange, sortDirection]
  );

  const handleSortDirectionChange = useCallback(() => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    if (onSortSelectChange) {
      onSortSelectChange(sortBy, newDirection);
    }
  }, [onSortSelectChange, sortBy, sortDirection]);

  return (
    <div className={styles.sortSelectContainer}>
      <select
        className={styles.sortSelect}
        value={sortBy}
        onChange={(e) => handleSortSelectChange(e)}
      >
        <option value="" disabled hidden>
          Sort
        </option>
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FaSort className={styles.sortIcon} onClick={handleSortDirectionChange} />
    </div>
  );
});

export default BrowseSortSelect;
