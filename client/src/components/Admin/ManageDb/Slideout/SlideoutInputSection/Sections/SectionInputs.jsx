import { memo } from "react";

import SlideoutInput from "../../SlideoutInput/SlideoutInput";

const SectionInputs = memo(function SectionInputs({
  inputs,
  data,
  handleInputChange,
}) {
  return (
    <>
      {inputs?.map((input) => (
        <SlideoutInput
          key={input.key}
          id={input.key}
          label={input.label}
          defaultValue={data[input.key] || ""}
          onChange={handleInputChange}
        />
      ))}
    </>
  );
});

export default SectionInputs;
