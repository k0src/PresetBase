import { useState } from "react";
import styles from "./FormCheckbox.module.css";

export default function FormCheckbox({ id, children }) {
  const [checked, setChecked] = useState(false);

  const handleChange = (e) => {
    setChecked(e.target.checked);
  };

  return (
    <label className={styles.label}>
      <input type="hidden" name={id} value={checked ? "yes" : "no"} />
      <input
        type="checkbox"
        className={styles.checkboxInput}
        checked={checked}
        onChange={handleChange}
      />
      <span className={styles.checkbox}></span>
      <span className={styles.checkboxText}>{children}</span>
    </label>
  );
}
