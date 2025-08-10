import AutofillDropdown from "../../AutofillDropdown/AutofillDropdown";
import styles from "./FormInput.module.css";
import classNames from "classnames";

export default function FormInput({
  required,
  type,
  id,
  autofill,
  label,
  children,
  disabled,
  ...inputProps
}) {
  return (
    <label className={styles.label}>
      {label} {required && <span className={styles.red}>*</span>}
      <input
        className={classNames(styles.input, { [styles.disabled]: disabled })}
        type={type}
        name={id}
        autoComplete="off"
        required={required || false}
        disabled={disabled}
        {...inputProps}
      />
      {/* add props */}
      {/* {autofill && <AutofillDropdown />} */}
      <small className={styles.small}>{children}</small>
    </label>
  );
}
