import { useState, useRef, useEffect, useCallback, useMemo } from "react";

import { getAutofillSuggestions } from "../../../api/api";
import { useFormSection } from "../FormSection/FormSection";
import AutofillDropdown from "../../AutofillDropdown/AutofillDropdown";
import styles from "./FormInputAutofill.module.css";
import classNames from "classnames";

export default function FormInputAutofill({
  required,
  type,
  id,
  autofillType,
  autofillLimit = 5,
  autofillSection = false,
  label,
  children,
  disabled,
  dataKey,
  ...inputProps
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimeout = useRef(null);
  const abortController = useRef(null);

  const formSection = useFormSection();

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const form = input.closest("form");
    if (!form) return;

    const handleReset = () => {
      setQuery("");
      setSuggestions([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
    };

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, []);

  const handleAttemptToAutofill = useCallback(
    async (value = query) => {
      if (!autofillSection || !formSection || !value.trim()) return;

      try {
        const success = await formSection.attemptAutofill(value.trim());
        if (success) {
          setShowDropdown(false);
          setSelectedIndex(-1);
        }
      } catch (error) {
        console.error("Autofill error:", error);
      }
    },
    [query, autofillSection, formSection]
  );

  const fetchSuggestions = useCallback(
    async (q) => {
      if (abortController.current) {
        abortController.current.abort();
      }

      abortController.current = new AbortController();

      try {
        const data = await getAutofillSuggestions(
          autofillType,
          q,
          autofillLimit
        );
        const suggestionList = data.map((row) => row.suggestion);

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
    [autofillType, autofillLimit]
  );

  const handleInputChange = useCallback(
    (e) => {
      const val = e.target.value;
      setQuery(val);
      setSelectedIndex(-1);

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
            const selectedValue = suggestions[selectedIndex];
            setQuery(selectedValue);
            setShowDropdown(false);
            setSelectedIndex(-1);
            if (autofillSection) {
              handleAttemptToAutofill(selectedValue);
            }
          }
          break;
        case "Escape":
        case "Tab":
          setShowDropdown(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [suggestions, selectedIndex, autofillSection, handleAttemptToAutofill]
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

  const handleSuggestionSelect = useCallback(
    (suggestion) => {
      setQuery(suggestion);
      setShowDropdown(false);
      setSelectedIndex(-1);
      if (autofillSection) {
        handleAttemptToAutofill(suggestion);
      }
    },
    [autofillSection, handleAttemptToAutofill]
  );

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);

    const handleProgrammaticChange = (e) => {
      if (e.target === inputRef.current) {
        setQuery(e.target.value);
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    if (inputRef.current) {
      inputRef.current.addEventListener("input", handleProgrammaticChange);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);

      if (inputRef.current) {
        inputRef.current.removeEventListener("input", handleProgrammaticChange);
      }

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [handleClickOutside]);

  const dropdown = useMemo(() => {
    if (showDropdown && suggestions.length > 0) {
      return (
        <AutofillDropdown
          suggestions={suggestions}
          selectedIndex={selectedIndex}
          onSelect={handleSuggestionSelect}
          type="form"
          ref={dropdownRef}
        />
      );
    }
    return null;
  }, [showDropdown, suggestions, selectedIndex, handleSuggestionSelect]);

  return (
    <label className={styles.label}>
      {label} {required && <span className={styles.red}>*</span>}
      <input
        ref={inputRef}
        value={query}
        className={classNames(styles.input, { [styles.disabled]: disabled })}
        type={type}
        name={id}
        data-key={dataKey || autofillType}
        autoComplete="off"
        required={required || false}
        disabled={disabled || false}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        {...inputProps}
      />
      {dropdown}
      <small className={styles.small}>{children}</small>
    </label>
  );
}
