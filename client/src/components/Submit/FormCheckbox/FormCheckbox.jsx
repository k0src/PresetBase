import styles from "./FormCheckbox.module.css";

export default function FormCheckbox({ id, children, checked, onChange }) {
  const handleChange = (e) => {
    const isChecked = e.target.checked;
    if (onChange) {
      onChange(isChecked);
    }
  };

  return (
    <label className={styles.label}>
      <input type="hidden" name={id} value={checked ? "yes" : "no"} />
      <input
        type="checkbox"
        className={styles.checkboxInput}
        checked={checked || false}
        onChange={handleChange}
      />
      <span className={styles.checkbox}></span>
      <span className={styles.checkboxText}>{children}</span>
    </label>
  );
}
