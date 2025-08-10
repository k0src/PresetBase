import FormInput from "../FormInput/FormInput";
import ImageInput from "../ImageInput/ImageInput";
import FormSelector from "../FormSelector/FormSelector";
import PresetSection from "../PresetSection/PresetSection";
import styles from "../SubmitForm/SubmitForm.module.css";

import { FaXmark } from "react-icons/fa6";

export default function SynthSection({
  index,
  presets,
  onRemove,
  onAddPreset,
  onRemovePreset,
}) {
  const handleRemove = () => {
    onRemove(index);
  };

  const handleAddPreset = () => {
    onAddPreset(index);
  };

  const handleRemovePreset = (presetIndex) => {
    onRemovePreset(index, presetIndex);
  };

  return (
    <div className={styles.synthSection}>
      {index > 0 && (
        <div className={styles.entryNewHeader}>
          <span className={styles.entryNewText}>Additional Synth</span>
          <FaXmark className={styles.entryDeleteBtn} onClick={handleRemove} />
        </div>
      )}

      <div className={styles.formSection}>
        <FormInput
          required
          type="text"
          id={`synths[${index}][name]`}
          autofill
          label="Synth Name"
        >
          Name the synth used in the track.
        </FormInput>

        <FormInput
          required
          type="text"
          id={`synths[${index}][manufacturer]`}
          autofill
          label="Manufacturer"
        >
          Provide the manufacturer or developer (e.g., Spectrasonics)
        </FormInput>

        <FormInput
          required
          type="number"
          id={`synths[${index}][year]`}
          label="Release Year"
        >
          Enter the synth's release year.
        </FormInput>

        <FormSelector
          label="Synth Type"
          id={`synths[${index}][type]`}
          required
          selectOptions={[
            { value: "VST", label: "VST" },
            { value: "Hardware", label: "Hardware" },
            { value: "Kontakt Bank", label: "Kontakt Bank" },
            { value: "SoundFont", label: "SoundFont" },
            { value: "Other", label: "Other" },
          ]}
        >
          Select the synth format.
        </FormSelector>

        <ImageInput label="Synth Image" id={`synths[${index}][img]`} required>
          Upload an image of the synth. Minimum dimensions: 1000 x 1000 pixels.
        </ImageInput>
      </div>

      <hr className={styles.hrSep} />

      {presets.map((preset, presetIndex) => (
        <PresetSection
          key={preset.id}
          synthIndex={index}
          presetIndex={presetIndex}
          onRemove={handleRemovePreset}
        />
      ))}

      <button type="button" className={styles.addBtn} onClick={handleAddPreset}>
        + Add Another Preset
      </button>
    </div>
  );
}
