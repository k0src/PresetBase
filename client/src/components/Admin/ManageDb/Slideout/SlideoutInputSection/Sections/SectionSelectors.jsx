import { memo } from "react";

import SlideoutSelector from "../../SlideoutSelector/SlideoutSelector";

const SectionSelectors = memo(function SectionSelectors({
  selectors,
  data,
  handleInputChange,
}) {
  return (
    <>
      {selectors?.map((selector) => (
        <SlideoutSelector
          key={selector.key}
          id={selector.key}
          label={selector.label}
          dataFields={selector.dataFields}
          searchTable={selector.searchTable}
          value={data[selector.key] ?? ""}
          onChange={handleInputChange}
        />
      ))}
    </>
  );
});

export default SectionSelectors;
