import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { generalAPI } from "../../../api/general";

import { FaMagnifyingGlass } from "react-icons/fa6";
import AutofillDropdown from "../../../components/AutofillDropdown/AutofillDropdown";
import styles from "./SearchBoxSmall.module.css";

export default function SearchBoxSmall({ limit }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const debounceTimeout = useRef(null);
  const abortController = useRef(null);

  const handleSearch = useCallback(
    (value = query) => {
      if (value.trim()) {
        navigate(
          `/search?query=${encodeURIComponent(value.trim().toLowerCase())}`
        );
        setQuery("");
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    },
    [query, navigate]
  );

  const fetchSuggestions = useCallback(
    async (q) => {
      if (abortController.current) {
        abortController.current.abort();
      }

      abortController.current = new AbortController();

      try {
        const data = await generalAPI.getEntryNames(q, limit, {
          signal: abortController.current.signal,
        });

        const suggestionList = data.map((row) => row.name);

        setSuggestions(suggestionList);
        setShowDropdown(suggestionList.length > 0);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching search suggestions:", err);
          setSuggestions([]);
          setShowDropdown(false);
        }
      }
    },
    [limit]
  );

  const handleInputChange = useCallback(
    (e) => {
      const val = e.target.value;
      setQuery(val);
      setSelectedIndex(-1);

      // Clear previous timeout
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        if (val.trim()) {
          fetchSuggestions(val.trim());
        } else {
          setSuggestions([]);
          setShowDropdown(false);
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
            handleSearch(suggestions[selectedIndex]);
          } else {
            handleSearch();
          }
          break;
        case "Escape":
          setShowDropdown(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [suggestions, selectedIndex, handleSearch]
  );

  const handleClickOutside = useCallback((e) => {
    if (
      inputRef.current &&
      !inputRef.current.contains(e.target) &&
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target)
    ) {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  }, []);

  const handleInputFocus = useCallback(() => {
    if (suggestions.length > 0 && query.trim()) {
      setShowDropdown(true);
    }
  }, [suggestions.length, query]);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);

      // Cleanup on unmount
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [handleClickOutside]);

  // Listener for Ctrl+K shortcut
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  const dropdown = useMemo(() => {
    if (showDropdown && suggestions.length > 0) {
      return (
        <AutofillDropdown
          suggestions={suggestions}
          selectedIndex={selectedIndex}
          onSelect={handleSearch}
          ref={dropdownRef}
        />
      );
    }
    return null;
  }, [showDropdown, suggestions, selectedIndex, handleSearch]);

  return (
    <div className={styles.searchBoxContainer}>
      <FaMagnifyingGlass className={styles.searchBoxIcon} />
      <input
        ref={inputRef}
        className={styles.searchBoxInput}
        type="search"
        placeholder="Search database..."
        enterKeyHint="search"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
      />

      {dropdown}

      <div className={styles.searchBoxShortcut}>
        <span className={styles.searchBoxShortcutText}>ctrl</span>
        <span className={styles.searchBoxShortcutText}>K</span>
      </div>
    </div>
  );
}
