import { useState, useCallback, memo } from "react";

import styles from "./BrowseFilter.module.css";
import { FaXmark } from "react-icons/fa6";

const BrowseFilter = memo(function BrowseFilter({
  placeholder,
  onFilterChange,
}) {
  const [filterText, setFilterText] = useState("");

  const clearFilter = useCallback(() => {
    setFilterText("");
    if (onFilterChange) {
      onFilterChange("");
    }
  }, [onFilterChange]);

  const handleFilterChange = useCallback(
    (e) => {
      const value = e.target.value;
      setFilterText(value);
      if (onFilterChange) {
        onFilterChange(value);
      }
    },
    [onFilterChange]
  );

  return (
    <div className={styles.browseFilter}>
      <input
        type="text"
        placeholder={placeholder}
        className={styles.filterInput}
        value={filterText}
        onChange={(e) => handleFilterChange(e)}
      />
      {filterText && (
        <FaXmark className={styles.filterClear} onClick={clearFilter} />
      )}
    </div>
  );
});

export default BrowseFilter;
