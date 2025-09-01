import { memo, useCallback } from "react";
import { useSlideout } from "../../../../../contexts/SlideoutContext";

import SlideoutImageInput from "../SlideoutImageInput/SlideoutImageInput";
import SectionInputs from "./Sections/SectionInputs";
import SectionSelectors from "./Sections/SectionSelectors";
import SectionLists from "./Sections/SectionLists";
import SectionColorPickers from "./Sections/SectionColorPickers";
import SectionToggles from "./Sections/SectionToggles";

import styles from "./SlideoutInputSection.module.css";

const SlideoutInputSection = memo(function SlideoutInputSection({
  data,
  config,
}) {
  const { setHasChanges } = useSlideout();

  const handleInputChange = useCallback(() => {
    setHasChanges(true);
  }, [setHasChanges]);

  if (!config || !data) return null;

  return (
    <div className={styles.inputSection}>
      {config.inputs && (
        <SectionInputs
          inputs={config.inputs}
          data={data}
          handleInputChange={handleInputChange}
        />
      )}

      {config.imageInput && (
        <SlideoutImageInput
          key={config.imageInput.key}
          initialImage={data[config.imageInput.key] || null}
          label={config.imageInput.label}
          id={config.imageInput.key}
          onChange={handleInputChange}
        />
      )}

      {config.toggles && (
        <div className={styles.toggles}>
          <SectionToggles
            toggles={config.toggles}
            data={data}
            handleToggleChange={handleInputChange}
          />
        </div>
      )}

      {config.colorPickers && (
        <div className={styles.colorPickers}>
          <SectionColorPickers
            colorPickers={config.colorPickers}
            data={data}
            handleInputChange={handleInputChange}
          />
        </div>
      )}

      {config.selectors && (
        <SectionSelectors
          selectors={config.selectors}
          data={data}
          handleInputChange={handleInputChange}
        />
      )}

      {config.lists && (
        <SectionLists
          lists={config.lists}
          data={data}
          handleInputChange={handleInputChange}
        />
      )}
    </div>
  );
});

export default SlideoutInputSection;
