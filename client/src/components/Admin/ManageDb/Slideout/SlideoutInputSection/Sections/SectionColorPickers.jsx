import { memo } from "react";

import SlideoutGenreColorPicker from "../../SlideoutGenreColorPicker/SlideoutGenreColorPicker";

const SectionColorPickers = memo(function SectionColorPickers({
  colorPickers,
  data,
  handleInputChange,
}) {
  return (
    <>
      {colorPickers?.map((colorPicker) => (
        <SlideoutGenreColorPicker
          key={colorPicker.key}
          label={colorPicker.label}
          id={colorPicker.key}
          value={data[colorPicker.key] || "#000000"}
          onChange={handleInputChange}
        />
      ))}
    </>
  );
});

export default SectionColorPickers;
