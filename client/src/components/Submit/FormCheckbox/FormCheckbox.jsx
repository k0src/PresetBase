import styles from "./FormCheckbox.module.css";

export default function FormCheckbox({ id, children }) {
  return (
    <label className={styles.label}>
      <input type="hidden" name={id} />
      <input type="checkbox" className={styles.checkboxInput} />
      <span className={styles.checkbox}></span>
      <span className={styles.checkboxText}>{children}</span>
    </label>
  );
}
