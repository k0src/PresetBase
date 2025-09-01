import { memo } from "react";

import SlideoutToggle from "../../SlideoutToggle/SlideoutToggle";

const SectionToggles = memo(function SectionToggles({
  toggles,
  data,
  handleToggleChange,
}) {
  return (
    <>
      {toggles?.map((toggle) => (
        <SlideoutToggle
          key={toggle.key}
          id={toggle.key}
          label={toggle.label}
          defaultValue={data[toggle.key] ?? ""}
          onChange={handleToggleChange}
        />
      ))}
    </>
  );
});

export default SectionToggles;
