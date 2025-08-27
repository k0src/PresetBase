import { memo, useState, useCallback, useRef, useEffect } from "react";

import SearchDropdown from "../SlideoutDropdown/SlideoutDropdown";
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
  const dropdownRef = useRef(null);

  const { idField, labelField, inputField } = dataFields;

  useEffect(() => {
    setItems(listItems || []);
  }, [listItems]);

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
    [items, hasInput, inputField, onChange]
  );

  const handleToggleDropdown = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleHideDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

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

      setIsOpen(false);
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

        <SearchDropdown
          isOpen={isOpen}
          onHide={handleHideDropdown}
          onSelect={handleSelectSuggestion}
          searchTable={searchTable}
          containerRef={dropdownRef}
          className={styles.dropDownContainer}
          inputClassName={styles.inputContainer}
        />

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
