import { useMemo, memo, useState, useCallback } from "react";
import { useSlideout } from "../../../../contexts/SlideoutContext";

import EntryTableCell from "../EntryTableCell/EntryTableCell";

import styles from "./EntryTable.module.css";
import classNames from "classnames";

import { FaPenToSquare } from "react-icons/fa6";

const TableRow = memo(
  ({ row, config, editingCell, setEditingCell, onEditClick }) => (
    <div
      className={classNames(
        styles[config.gridClass],
        styles.tableRow,
        row.originalIndex % 2 === 1 ? styles.oddRow : ""
      )}
    >
      {config.columns.map((column) =>
        column.key === "id" ? (
          <span key={column.key} className={styles.rowNumber}>
            {row[column.key]}
          </span>
        ) : (
          <EntryTableCell
            key={column.key}
            rowId={row.id}
            columnKey={column.key}
            value={row[column.key]}
            editingCell={editingCell}
            setEditingCell={setEditingCell}
          />
        )
      )}

      <button
        type="button"
        className={styles.editBtn}
        onClick={() => onEditClick(row.id)}
      >
        <FaPenToSquare className={styles.editIcon} />
      </button>
    </div>
  )
);

export default function EntryTable({
  data,
  config,
  filterText = "",
  entryType,
}) {
  const [editingCell, setEditingCell] = useState(null);
  const { openSlideout } = useSlideout();

  const handleEditClick = useCallback(
    (rowId) => {
      if (entryType && rowId) {
        openSlideout(entryType, rowId);
      }
    },
    [entryType, openSlideout]
  );

  const filteredData = useMemo(() => {
    const dataRowsWithIndex = data.map((item, originalIndex) => ({
      ...item,
      originalIndex,
    }));

    if (!filterText) return dataRowsWithIndex;

    const searchText = filterText.toLowerCase();

    return dataRowsWithIndex.filter((row) => {
      return config.filterOptions.some((filterKey) => {
        const value = row[filterKey];
        return value && value.toString().toLowerCase().includes(searchText);
      });
    });
  }, [data, filterText, config.filterOptions]);

  const columnHeaders = useMemo(
    () =>
      config.columns.map((column) => (
        <span key={column.key}>{column.label}</span>
      )),
    [config.columns]
  );

  return (
    <section>
      <div
        className={classNames(styles[config.gridClass], styles.tableColumns)}
      >
        {columnHeaders}
      </div>
      {filteredData.map((row) => (
        <TableRow
          key={row.id}
          row={row}
          config={config}
          editingCell={editingCell}
          setEditingCell={setEditingCell}
          onEditClick={handleEditClick}
        />
      ))}
    </section>
  );
}
