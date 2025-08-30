import { memo, useState, useEffect } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import styles from "./SlideoutGenreColorPicker.module.css";

const SlideoutGenreColorPicker = memo(function SlideoutGenreColorPicker({
  value,
  label,
  id,
  onChange,
}) {
  const [color, setColor] = useState(value || "#ffffff");
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    setColor(value || "#ffffff");
  }, [value]);

  const handleColorChange = (newColor) => {
    setColor(newColor);
    if (!hasChanged) {
      setHasChanged(true);
    }
    if (onChange) {
      onChange();
    }
  };

  return (
    <div className={styles.colorPickerContainer}>
      <span className={styles.labelText}>{label}</span>

      <HexColorPicker
        className={styles.colorPicker}
        color={color}
        onChange={handleColorChange}
      />

      <HexColorInput
        className={styles.colorInput}
        color={color}
        onChange={handleColorChange}
        prefixed
        name={hasChanged ? id : undefined}
      />
    </div>
  );
});

export default SlideoutGenreColorPicker;
