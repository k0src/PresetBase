import { memo, useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import styles from "./SlideoutGenreColorPicker.module.css";

const SlideoutGenreColorPicker = memo(function SlideoutGenreColorPicker({
  defaultValue,
  label,
}) {
  const [color, setColor] = useState(defaultValue || "#ffffff");

  return (
    <div className={styles.colorPickerContainer}>
      <span className={styles.labelText}>{label}</span>

      <HexColorPicker
        className={styles.colorPicker}
        color={color}
        onChange={setColor}
      />

      <HexColorInput
        className={styles.colorInput}
        color={color}
        onChange={setColor}
      />
    </div>
  );
});

export default SlideoutGenreColorPicker;
