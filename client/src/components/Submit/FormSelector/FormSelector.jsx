import styles from "./FormSelector.module.css";

export default function FormSelector({
  label,
  id,
  children,
  required,
  selectOptions = [],
}) {
  return (
    <label className={styles.label}>
      {label} {required && <span className={styles.red}>*</span>}
      <select className={styles.select} required={required || false} name={id}>
        {selectOptions.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <small className={styles.small}>{children}</small>
    </label>
  );
}
