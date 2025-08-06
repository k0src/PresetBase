import { useState } from "react";

import styles from "./BrowseFilter.module.css";
import { FaXmark } from "react-icons/fa6";

export default function BrowseFilter({ placeholder, onFilterChange }) {
  const [filterText, setFilterText] = useState("");

  const clearFilter = () => {
    setFilterText("");
    if (onFilterChange) {
      onFilterChange("");
    }
  };

  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
    if (onFilterChange) {
      onFilterChange(e.target.value);
    }
  };

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
}
