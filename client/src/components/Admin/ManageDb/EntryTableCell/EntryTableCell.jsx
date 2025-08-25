import { memo, useRef, useEffect } from "react";

import styles from "./EntryTableCell.module.css";
import classNames from "classnames";

const EntryTableCell = memo(function EntryTableCell({
  rowId,
  columnKey,
  value,
  editingCell,
  setEditingCell,
}) {
  const inputRef = useRef(null);
  const isEditing =
    editingCell?.rowId === rowId && editingCell?.columnKey === columnKey;

  const handleDoubleClick = () => {
    setEditingCell({
      rowId,
      columnKey,
      value: value?.toString() || "",
    });
  };

  const handleBlur = () => setEditingCell(null);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") setEditingCell(null);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      const input = inputRef.current;
      input.style.width = "auto";
      const scrollWidth = input.scrollWidth;

      const tableElement = input.closest("section");
      const tableRect = tableElement.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();
      const availableWidth = tableRect.right - inputRect.left - 4;

      input.style.width = `${Math.min(scrollWidth, availableWidth)}px`;

      input.focus();
      input.select();
    }
  }, [isEditing]);

  return (
    <div
      className={classNames(
        styles.cellContainer,
        isEditing && styles.cellContainerEditing
      )}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editingCell.value}
          onChange={(e) =>
            setEditingCell({ ...editingCell, value: e.target.value })
          }
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={styles.fullTextField}
          readOnly
        />
      ) : (
        <span className={styles.rowText}>{value}</span>
      )}
    </div>
  );
});

export default EntryTableCell;
