import { memo, useState, useCallback, useRef, useEffect } from "react";
import { nanoid } from "nanoid";

import SearchDropdown from "../SlideoutDropdown/SlideoutDropdown";
import SlideoutAudioInput from "../SlideoutAudioInput/SlideoutAudioInput";
import styles from "./SlideoutList.module.css";
import classNames from "classnames";

import { FaPlus, FaXmark } from "react-icons/fa6";

const SlideoutList = memo(function SlideoutList({
  id,
  label,
  listItems,
  hasInput,
  inputLabel,
  hasAudio,
  dataFields,
  searchTable,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState(listItems || []);
  const [hasChanged, setHasChanged] = useState(false);
  const dropdownRef = useRef(null);

  const { idField, labelField, inputField, audioFile } = dataFields;

  useEffect(() => {
    setItems(listItems || []);
  }, [listItems]);

  const handleRemoveItem = useCallback(
    (index) => {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      if (!hasChanged) {
        setHasChanged(true);
      }
      if (onChange) {
        onChange();
      }
    },
    [items, hasChanged, onChange]
  );

  const handleInputChange = useCallback(
    (index, value) => {
      const newItems = [...items];
      if (hasInput) {
        newItems[index] = { ...newItems[index], [inputField]: value };
        setItems(newItems);
        if (!hasChanged) {
          setHasChanged(true);
        }
        if (onChange) {
          onChange();
        }
      }
    },
    [items, hasInput, inputField, hasChanged, onChange]
  );

  const handleAudioChange = useCallback(() => {
    if (!hasChanged) {
      setHasChanged(true);
      if (onChange) onChange();
    }
  }, [hasChanged, onChange]);

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
        if (!hasChanged) {
          setHasChanged(true);
        }
        if (onChange) {
          onChange();
        }
      }

      setIsOpen(false);
    },
    [idField, labelField, inputField, hasInput, items, hasChanged, onChange]
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
          {items.map((item, index) => {
            let entryClassName = styles.listEntrySingle;
            if (hasInput && hasAudio) {
              entryClassName = styles.listEntryAudio;
            } else if (hasInput) {
              entryClassName = styles.listEntryDouble;
            }

            return (
              <div key={`${item[idField]}-${index}`} className={entryClassName}>
                <div className={styles.listEntryTextWrapper}>
                  <span className={styles.listEntryText}>
                    {item[labelField]}
                  </span>
                </div>
                {hasAudio && (
                  <SlideoutAudioInput
                    initialAudio={item[audioFile]}
                    id={`${id}[${index}][audioUrl]`}
                    audioSourceId={`${nanoid()}-${id}[${index}][audioUrl]`}
                    onFileChange={handleAudioChange}
                  />
                )}
                {hasInput && (
                  <input
                    type="text"
                    className={styles.listEntryInput}
                    placeholder={inputLabel}
                    value={item[inputField] ?? ""}
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
            );
          })}

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
              name={hasChanged ? `${id}[${index}][${idField}]` : undefined}
              value={item[idField] ?? ""}
            />
            {hasInput && (
              <input
                type="hidden"
                name={hasChanged ? `${id}[${index}][${inputField}]` : undefined}
                value={item[inputField] ?? ""}
              />
            )}
            {hasAudio && (
              <input
                type="hidden"
                name={
                  hasChanged ? `${id}[${index}][songPresetsRowId]` : undefined
                }
                value={item.songPresetsRowId ?? ""}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default SlideoutList;
