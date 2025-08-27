import { memo, useState, useCallback, useRef, useEffect } from "react";

import SearchDropdown from "../SlideoutDropdown/SlideoutDropdown";
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
  const dropdownRef = useRef(null);

  const { idField, labelField } = dataFields;

  useEffect(() => {
    setSelectedValue(value || {});
  }, [value]);

  const handleToggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleHideDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelectSuggestion = useCallback(
    (selectedItem) => {
      setSelectedValue({
        [idField]: selectedItem.id,
        [labelField]: selectedItem.label,
      });

      if (onChange) {
        onChange();
      }

      setIsOpen(false);
    },
    [idField, labelField, onChange]
  );

  return (
    <div className={styles.selectorContainer}>
      <span className={styles.labelText}>{label}</span>

      <div>
        <input type="hidden" name={id} value={selectedValue[idField] ?? ""} />
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

        <SearchDropdown
          isOpen={isOpen}
          onHide={handleHideDropdown}
          onSelect={handleSelectSuggestion}
          searchTable={searchTable}
          containerRef={dropdownRef}
          className={styles.dropDownContainer}
          inputClassName={styles.inputContainer}
        />
      </div>
    </div>
  );
});

export default SlideoutSelector;
