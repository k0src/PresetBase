import { memo, useState, useCallback, useRef, useEffect } from "react";
import { getFieldData } from "../../../../../api/admin";

import AutofillDropdown from "../../../../AutofillDropdown/AutofillDropdown";
import styles from "./SlideoutSelector.module.css";
import classNames from "classnames";

import { FaCaretDown } from "react-icons/fa6";

const SlideoutSelector = memo(function SlideoutSelector({
  label,
  id,
  dataFields,
  searchTable,
  value,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || {});
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimeout = useRef(null);

  const { idField, labelField } = dataFields;

  useEffect(() => {
    setSelectedValue(value || {});
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
        setSelectedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const fetchSuggestions = useCallback(
    async (query) => {
      if (!searchTable) return;

      try {
        setLoading(true);
        const results = await getFieldData(searchTable, query, 7);
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

  const handleToggleDropdown = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    setSearchQuery("");
    setSelectedIndex(-1);

    if (newIsOpen) {
      fetchSuggestions("");
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  }, [isOpen, fetchSuggestions]);

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

  const handleHideDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchQuery("");
    setSelectedIndex(-1);
    setSuggestions([]);
  }, []);

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
            handleSelectSuggestion(suggestions[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          handleHideDropdown();
          break;
      }
    },
    [suggestions, selectedIndex]
  );

  const handleSelectSuggestion = useCallback(
    (selectedItem) => {
      setSelectedValue({
        [idField]: selectedItem.id,
        [labelField]: selectedItem.label,
      });

      if (onChange) {
        onChange();
      }

      handleHideDropdown();
    },
    [idField, labelField, onChange]
  );

  return (
    <div className={styles.selectorContainer}>
      <span className={styles.labelText}>{label}</span>

      <div ref={dropdownRef}>
        <input type="hidden" name={id} value={selectedValue[idField] || ""} />
        <div
          className={classNames(styles.textContainer, {
            [styles.show]: isOpen,
          })}
          onClick={handleToggleDropdown}
        >
          <span className={styles.selectorText}>
            {selectedValue[labelField]}
          </span>
          <FaCaretDown
            className={classNames(styles.selectorIcon, {
              [styles.open]: isOpen,
            })}
          />
        </div>

        {isOpen && (
          <div className={styles.dropDownContainer}>
            <div className={styles.inputContainer}>
              <input
                ref={inputRef}
                type="text"
                className={styles.filterInput}
                placeholder={`Search ${searchTable}...`}
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
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
        )}
      </div>
    </div>
  );
});

export default SlideoutSelector;
