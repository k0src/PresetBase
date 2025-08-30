import { useState, useRef } from "react";
import styles from "./SlideoutInput.module.css";
import classNames from "classnames";

export default function SlideoutInput({
  id,
  label,
  disabled,
  defaultValue,
  onChange,
  ...inputProps
}) {
  const [hasChanged, setHasChanged] = useState(false);
  const inputRef = useRef(null);

  const handleChange = (e) => {
    if (!hasChanged) {
      setHasChanged(true);
      if (onChange) onChange();
    }
  };

  return (
    <div className={styles.slideoutInput}>
      <span className={styles.labelText}>{label}</span>
      <input
        ref={inputRef}
        className={classNames(styles.input, { [styles.disabled]: disabled })}
        type="text"
        name={hasChanged ? id : undefined}
        autoComplete="off"
        required
        disabled={disabled || false}
        defaultValue={defaultValue}
        onChange={handleChange}
        {...inputProps}
      />
    </div>
  );
}
