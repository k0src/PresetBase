import styles from "./TableSelector.module.css";

const tableOptions = [
  { value: "songs", label: "Songs" },
  { value: "artists", label: "Artists" },
  { value: "albums", label: "Albums" },
  { value: "synths", label: "Synths" },
  { value: "presets", label: "Presets" },
  { value: "genres", label: "Genres" },
];

export default function TableSelector({ selectedTable, onTableChange }) {
  const handleChange = (e) => {
    onTableChange(e.target.value);
  };

  return (
    <select
      className={styles.tableSelector}
      value={selectedTable}
      onChange={handleChange}
    >
      {tableOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
