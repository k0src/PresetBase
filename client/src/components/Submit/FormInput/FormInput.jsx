import AutofillDropdown from "../../AutofillDropdown/AutofillDropdown";
import styles from "./FormInput.module.css";

export default function FormInput({
  required,
  type,
  id,
  autofill,
  label,
  children,
  ...inputProps
}) {
  return (
    <label className={styles.label}>
      {label} {required && <span className={styles.red}>*</span>}
      <input
        className={styles.input}
        type={type}
        name={id}
        autoComplete="off"
        required={required || false}
        {...inputProps}
      />
      {/* add props */}
      {/* {autofill && <AutofillDropdown />} */}
      <small className={styles.small}>{children}</small>
    </label>
  );
}
