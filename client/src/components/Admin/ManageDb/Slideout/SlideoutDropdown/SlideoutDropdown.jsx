import { memo, useState, useCallback, useRef, useEffect } from "react";
import { adminAPI } from "../../../../../api/admin";

import AutofillDropdown from "../../../../AutofillDropdown/AutofillDropdown";
import styles from "./SlideoutDropdown.module.css";

const SearchDropdown = memo(function SearchDropdown({
  isOpen,
  onHide,
  onSelect,
  searchTable,
  placeholder,
  containerRef,
  autoFocus = true,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedIndex(-1);
      setSuggestions([]);
    } else if (autoFocus) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  }, [isOpen, autoFocus]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef?.current &&
        !containerRef.current.contains(event.target)
      ) {
        onHide?.();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, containerRef, onHide]);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const fetchSuggestions = useCallback(
    async (query) => {
      if (!searchTable) return;

      try {
        setLoading(true);
        const results = await adminAPI.getFieldData(searchTable, query, 7);
        setSuggestions(results);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [searchTable]
  );

  useEffect(() => {
    if (isOpen && searchTable) {
      fetchSuggestions("");
    }
  }, [isOpen, searchTable, fetchSuggestions]);

  const handleSearchChange = useCallback(
    (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      setSelectedIndex(-1);

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        if (query.trim()) {
          fetchSuggestions(query.trim());
        } else {
          fetchSuggestions("");
        }
      }, 150);
    },
    [fetchSuggestions]
  );

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "ArrowDown":
          if (suggestions.length > 0) {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % suggestions.length);
          }
          break;
        case "ArrowUp":
          if (suggestions.length > 0) {
            e.preventDefault();
            setSelectedIndex((prev) =>
              prev > 0 ? prev - 1 : suggestions.length - 1
            );
          }
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            onSelect?.(suggestions[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          onHide?.();
          break;
      }
    },
    [suggestions, selectedIndex, onSelect, onHide]
  );

  const handleSelectSuggestion = useCallback(
    (selectedItem) => {
      onSelect?.(selectedItem);
    },
    [onSelect]
  );

  if (!isOpen) return null;

  return (
    <div className={styles.dropDownContainer}>
      <div className={styles.filterContainer}>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder || `Search ${searchTable}...`}
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className={styles.filterInput}
        />
      </div>

      {loading ? (
        <div className={styles.loadingMessage}>Loading...</div>
      ) : suggestions.length > 0 ? (
        <AutofillDropdown
          suggestions={suggestions}
          selectedIndex={selectedIndex}
          onSelect={handleSelectSuggestion}
          type="admin"
        />
      ) : searchQuery ? (
        <div className={styles.noResults}>No results found</div>
      ) : null}
    </div>
  );
});

export default SearchDropdown;
