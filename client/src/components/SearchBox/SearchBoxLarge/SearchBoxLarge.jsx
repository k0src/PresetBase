import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import AutofillDropdown from "../../../components/AutofillDropdown/AutofillDropdown";
import ButtonMain from "../../Buttons/ButtonMain/ButtonMain";
import styles from "./SearchBoxLarge.module.css";

import { FaMagnifyingGlass } from "react-icons/fa6";
import { PulseLoader } from "react-spinners";

export default function SearchBoxLarge({ limit }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const debounceTimeout = useRef(null);
  const abortController = useRef(null);

  const override = {
    opacity: 0.5,
  };

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
      // Cancel previous request
      if (abortController.current) {
        abortController.current.abort();
      }

      abortController.current = new AbortController();

      const url = `/api/getallnames?query=${encodeURIComponent(
        q
      )}&limit=${limit}`;

      try {
        setLoading(true);
        const res = await fetch(url, {
          signal: abortController.current.signal,
        });

        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();
        const suggestionList = data.map((row) => row.name);

        setSuggestions(suggestionList);
        setShowDropdown(suggestionList.length > 0);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching search suggestions:", err);
          setSuggestions([]);
          setShowDropdown(false);
        }
      } finally {
        setLoading(false);
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
          setLoading(false);
        }
      }, 150);
    },
    [fetchSuggestions]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % suggestions.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
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

  // Memoize the dropdown
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
      <div className={styles.searchBoxInputContainer}>
        <FaMagnifyingGlass className={styles.searchBoxIcon} />
        <input
          ref={inputRef}
          className={styles.searchBoxInput}
          type="search"
          placeholder="Search songs, artists, synths, presets..."
          enterKeyHint="search"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
        />

        {dropdown}

        <PulseLoader
          loading={loading}
          cssOverride={override}
          color="#e3e5e4"
          size={6}
        />
      </div>
      <ButtonMain onClick={() => handleSearch()}>Search</ButtonMain>
    </div>
  );
}
