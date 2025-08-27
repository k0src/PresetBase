import { memo, useState, useCallback, useRef, useEffect } from "react";
import { getFieldData } from "../../../../../api/admin";

import AutofillDropdown from "../../../../AutofillDropdown/AutofillDropdown";
import styles from "./SlideoutList.module.css";
import classNames from "classnames";

import { FaPlus, FaXmark } from "react-icons/fa6";

const SlideoutList = memo(function SlideoutList({
  id,
  label,
  listItems,
  hasInput,
  inputLabel,
  dataFields,
  searchTable,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState(listItems || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimeout = useRef(null);

  const { idField, labelField, inputField } = dataFields;

  useEffect(() => {
    setItems(listItems || []);
  }, [listItems]);

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

  const handleRemoveItem = useCallback(
    (index) => {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      if (onChange) {
        onChange();
      }
    },
    [items, onChange]
  );

  const handleInputChange = useCallback(
    (index, value) => {
      const newItems = [...items];
      if (hasInput) {
        newItems[index] = { ...newItems[index], [inputField]: value };
        setItems(newItems);
        if (onChange) {
          onChange();
        }
      }
    },
    [items, hasInput, dataFields, onChange]
  );

  const handleToggleDropdown = useCallback(() => {
    setIsOpen(true);
    setSearchQuery("");
    setSelectedIndex(-1);
    fetchSuggestions("");

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  }, [fetchSuggestions]);

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
      const newItem = {
        [idField]: selectedItem.id,
        [labelField]: selectedItem.label,
      };

      if (hasInput) {
        newItem[inputField] = "";
      }

      if (!items.find((item) => item[idField] === newItem[idField])) {
        setItems([...items, newItem]);
        if (onChange) {
          onChange();
        }
      }

      handleHideDropdown();
    },
    [idField, labelField, inputField, hasInput, items, onChange]
  );

  return (
    <div className={styles.listContainer}>
      <span className={styles.labelText}>{label}</span>

      <div className={styles.listWrapper}>
        <div
          className={classNames(styles.listEntriesContainer, {
            [styles.show]: isOpen,
          })}
        >
          {items.map((item, index) => (
            <div
              key={`${item[idField]}-${index}`}
              className={
                hasInput ? styles.listEntryDouble : styles.listEntrySingle
              }
            >
              <div className={styles.listEntryTextWrapper}>
                <span className={styles.listEntryText}>{item[labelField]}</span>
              </div>
              {hasInput && (
                <input
                  type="text"
                  className={styles.listEntryInput}
                  placeholder={inputLabel}
                  value={item[inputField] || ""}
                  required
                  onChange={(e) => handleInputChange(index, e.target.value)}
                />
              )}
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => handleRemoveItem(index)}
              >
                <FaXmark className={styles.removeIcon} />
              </button>
            </div>
          ))}

          {!isOpen && (
            <div className={styles.addBtnContainer}>
              <button
                type="button"
                className={styles.addBtn}
                onClick={handleToggleDropdown}
              >
                <FaPlus />
              </button>
            </div>
          )}
        </div>

        {isOpen && (
          <div className={styles.dropDownContainer} ref={dropdownRef}>
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
            ) : (
              searchQuery && (
                <div className={styles.noResults}>No results found</div>
              )
            )}
          </div>
        )}

        {items.map((item, index) => (
          <div key={`hidden-${item[idField]}-${index}`}>
            <input
              type="hidden"
              name={`${id}[${index}][${idField}]`}
              value={item[idField] || ""}
            />
            {hasInput && (
              <input
                type="hidden"
                name={`${id}[${index}][${inputField}]`}
                value={item[inputField] || ""}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default SlideoutList;
