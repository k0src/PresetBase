import { useRef, useEffect } from "react";
import styles from "./FormSelector.module.css";

export default function FormSelector({
  label,
  id,
  children,
  required,
  disabled,
  selectOptions = [],
  dataKey,
  defaultValue = "",
  ...selectProps
}) {
  const selectRef = useRef(null);

  useEffect(() => {
    if (selectRef.current && defaultValue) {
      selectRef.current.value = defaultValue;
    }
  }, [defaultValue]);

  return (
    <label className={styles.label}>
      {label} {required && <span className={styles.red}>*</span>}
      <select
        ref={selectRef}
        className={styles.select}
        required={required || false}
        name={id}
        data-key={dataKey}
        disabled={disabled || false}
        defaultValue={defaultValue}
        {...selectProps}
      >
        <option value="" hidden disabled>
          Select an option
        </option>
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
