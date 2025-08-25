import styles from "./AdminSlideoutInput.module.css";
import classNames from "classnames";

export default function AdminSlideoutInput({
  required,
  type,
  id,
  label,
  disabled,
  ...inputProps
}) {
  return (
    <div className={styles.slideoutInput}>
      <span className={styles.labelText}>{label}</span>
      <input
        className={classNames(styles.input, { [styles.disabled]: disabled })}
        type={type}
        name={id}
        autoComplete="off"
        required={required || false}
        disabled={disabled || false}
        {...inputProps}
      />
    </div>
  );
}
