import { Link } from "react-router-dom";

import FormInputAutofill from "../FormInputAutofill/FormInputAutofill";
import AudioInput from "../AudioInput/AudioInput";
import FormSection from "../FormSection/FormSection";
import styles from "../SubmitForm/SubmitForm.module.css";

import { FaXmark } from "react-icons/fa6";

export default function PresetSection({ synthIndex, presetIndex, onRemove }) {
  const handleRemove = () => {
    onRemove(synthIndex, presetIndex);
  };

  return (
    <FormSection type="presetName" className={styles.formSection}>
      {presetIndex > 0 && (
        <>
          <hr className={styles.hrSep} />
          <div className={styles.entryNewHeader}>
            <span className={styles.entryNewText}>Additional Preset</span>
            <FaXmark className={styles.entryDeleteBtn} onClick={handleRemove} />
          </div>
        </>
      )}

      <FormInputAutofill
        required
        type="text"
        id={`synths[${synthIndex}][presets][${presetIndex}][name]`}
        label="Preset Name"
        autofillType="presetName"
        autofillSection
      >
        Enter the full name of the exact preset used (e.g., 2 Sparklepad BT, LD
        King of Buzz 2).
      </FormInputAutofill>

      <FormInputAutofill
        type="text"
        id={`synths[${synthIndex}][presets][${presetIndex}][packName]`}
        label="Pack Name"
        autofillType="presetPack"
      >
        Provide the name of the preset pack. Leave blank for built-in presets.
      </FormInputAutofill>

      <FormInputAutofill
        type="text"
        id={`synths[${synthIndex}][presets][${presetIndex}][author]`}
        label="Preset Author"
        autofillType="presetAuthor"
      >
        Identify who created the preset or preset pack. Leave blank for
        manufacturer, for factory presets.{" "}
        <Link to="/submit/info/preset-authors">
          Where do I find preset authors?
        </Link>
      </FormInputAutofill>

      <FormInputAutofill
        type="text"
        id={`synths[${synthIndex}][presets][${presetIndex}][usageType]`}
        required
        label="Usage Type"
        autofillType="presetUsageType"
      >
        Describe how the preset was used (e.g., Lead, Pad, Sequence).{" "}
        <Link to="/submit/info/preset-usage-types">
          What do I enter for the usage type?
        </Link>
      </FormInputAutofill>

      <AudioInput
        label="Preset Audio (Optional)"
        id={`synths[${synthIndex}][presets][${presetIndex}][audio]`}
      >
        Upload a short <kbd>.mp3</kbd> audio clip (approximately 4 bars)
        demonstrating how the preset is used in the song. The clip should
        feature the melody played <strong>without any external effects</strong>.{" "}
        <Link to="/submit/info/preset-audio">
          How do I properly export preset audios?
        </Link>
      </AudioInput>
    </FormSection>
  );
}
