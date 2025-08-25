import { useState, useCallback, memo, useEffect } from "react";

import styles from "./ManageDbFilter.module.css";
import { FaXmark } from "react-icons/fa6";

const ManageDbFilter = memo(function ManageDbFilter({
  placeholder,
  onFilterChange,
  value = "",
}) {
  const [filterText, setFilterText] = useState(value);

  useEffect(() => {
    setFilterText(value);
  }, [value]);

  const clearFilter = useCallback(() => {
    setFilterText("");
    if (onFilterChange) {
      onFilterChange("");
    }
  }, [onFilterChange]);

  const handleFilterChange = useCallback(
    (e) => {
      const inputValue = e.target.value;
      setFilterText(inputValue);
      if (onFilterChange) {
        onFilterChange(inputValue);
      }
    },
    [onFilterChange]
  );

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filter}>
        <input
          type="text"
          className={styles.filterInput}
          placeholder={placeholder}
          value={filterText}
          onChange={handleFilterChange}
        />

        <FaXmark className={styles.clearBtn} onClick={clearFilter} />
      </div>
    </div>
  );
});

export default ManageDbFilter;
