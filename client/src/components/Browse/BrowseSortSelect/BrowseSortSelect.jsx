import styles from "./BrowseSortSelect.module.css";
import { FaSort } from "react-icons/fa6";

export default function BrowseSortSelect({
  sortOptions,
  onSortSelectChange,
  sortBy,
  sortDirection,
}) {
  const handleSortSelectChange = (e) => {
    const newSort = e.target.value;
    if (onSortSelectChange) {
      onSortSelectChange(newSort, sortDirection);
    }
  };

  const handleSortDirectionChange = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    if (onSortSelectChange) {
      onSortSelectChange(sortBy, newDirection);
    }
  };

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
}
