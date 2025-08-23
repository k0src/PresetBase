import { useState, useEffect } from "react";
import styles from "./FormSelector.module.css";

export default function FormSelector({
  label,
  id,
  children,
  required,
  disabled,
  selectOptions = [],
  dataKey,
  defaultValue,
  ...selectProps
}) {
  const [value, setValue] = useState(defaultValue || "");

  useEffect(() => {
    setValue(defaultValue || "");
  }, [defaultValue]);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <label className={styles.label}>
      {label} {required && <span className={styles.red}>*</span>}
      <select
        className={styles.select}
        required={required || false}
        name={id}
        data-key={dataKey}
        disabled={disabled || false}
        value={value}
        onChange={handleChange}
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
