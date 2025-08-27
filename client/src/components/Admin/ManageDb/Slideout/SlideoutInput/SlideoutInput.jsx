import styles from "./SlideoutInput.module.css";
import classNames from "classnames";

export default function SlideoutInput({ id, label, disabled, ...inputProps }) {
  return (
    <div className={styles.slideoutInput}>
      <span className={styles.labelText}>{label}</span>
      <input
        className={classNames(styles.input, { [styles.disabled]: disabled })}
        type="text"
        name={id}
        autoComplete="off"
        required
        disabled={disabled || false}
        {...inputProps}
      />
    </div>
  );
}
