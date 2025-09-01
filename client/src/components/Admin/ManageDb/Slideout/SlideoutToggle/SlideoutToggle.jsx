import { memo, useState, useCallback } from "react";
import styles from "./SlideoutToggle.module.css";
import classNames from "classnames";

const SlideoutToggle = memo(function SlideoutToggle({
  id,
  label,
  defaultValue,
  onChange,
}) {
  const [isOn, setIsOn] = useState(defaultValue === "t");
  const [hasChanged, setHasChanged] = useState(false);

  const handleToggle = useCallback(() => {
    const newValue = !isOn;
    setIsOn(newValue);

    if (!hasChanged) {
      setHasChanged(true);
      if (onChange) onChange();
    }
  }, [isOn, hasChanged, onChange]);

  return (
    <div className={styles.slideoutToggle}>
      <span className={styles.labelText}>{label}</span>
      <div
        className={classNames(styles.toggleContainer, {
          [styles.on]: isOn,
          [styles.off]: !isOn,
        })}
        onClick={handleToggle}
      >
        <div className={styles.toggleSwitch} />
      </div>

      <input
        type="hidden"
        name={hasChanged ? id : undefined}
        value={isOn ? "t" : "f"}
      />
    </div>
  );
});

export default SlideoutToggle;
