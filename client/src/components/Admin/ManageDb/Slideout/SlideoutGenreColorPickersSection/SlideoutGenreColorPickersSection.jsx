import { memo } from "react";

import SlideoutGenreColorPicker from "../SlideoutGenreColorPicker/SlideoutGenreColorPicker";
import styles from "./SlideoutGenreColorPickersSection.module.css";

const SlideoutGenreColorPickersSection = memo(
  function SlideoutGenreColorPickersSection({ genreData }) {
    return (
      <div className={styles.colorPickers}>
        <SlideoutGenreColorPicker
          defaultValue={genreData.textColor || "#ffffff"}
          label="Text Color"
        />

        <SlideoutGenreColorPicker
          defaultValue={genreData.backgroundColor || "#ffffff"}
          label="Background Color"
        />

        <SlideoutGenreColorPicker
          defaultValue={genreData.borderColor || "#ffffff"}
          label="Border Color"
        />
      </div>
    );
  }
);

export default SlideoutGenreColorPickersSection;
