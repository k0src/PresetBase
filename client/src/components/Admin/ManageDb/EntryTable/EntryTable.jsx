import { useMemo, memo } from "react";

import styles from "./EntryTable.module.css";
import classNames from "classnames";

import { FaPenToSquare } from "react-icons/fa6";

export default function EntryTable({ data, config, filterText = "" }) {
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

  const TableRow = memo(({ row }) => (
    <div
      key={row.id}
      className={classNames(
        styles[config.gridClass],
        styles.tableRow,
        row.originalIndex % 2 === 1 ? styles.oddRow : ""
      )}
    >
      <span className={styles.rowNumber}>{row.originalIndex + 1}</span>
      {config.columns.map((column) => (
        <span key={column.key} className={styles.rowText}>
          {row[column.key]}
        </span>
      ))}

      <button type="button" className={styles.editBtn}>
        <FaPenToSquare className={styles.editIcon} />
      </button>
    </div>
  ));

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
        <span>#</span>
        {columnHeaders}
      </div>

      {filteredData.map((row) => (
        <TableRow key={row.id} row={row} />
      ))}
    </section>
  );
}
