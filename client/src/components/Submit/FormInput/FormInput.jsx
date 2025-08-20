import styles from "./FormInput.module.css";
import classNames from "classnames";

export default function FormInput({
  required,
  type,
  id,
  label,
  children,
  disabled,
  dataKey,
  ...inputProps
}) {
  return (
    <label className={styles.label}>
      {label} {required && <span className={styles.red}>*</span>}
      <input
        className={classNames(styles.input, { [styles.disabled]: disabled })}
        type={type}
        name={id}
        data-key={dataKey}
        autoComplete="off"
        required={required || false}
        disabled={disabled || false}
        {...inputProps}
      />
      <small className={styles.small}>{children}</small>
    </label>
  );
}
