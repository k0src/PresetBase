import { useState, useRef, useEffect } from "react";
import { FaXmark } from "react-icons/fa6";

import { useSubmitForm } from "../../../hooks/useSubmitForm";
import { useApproveSubmission } from "../../../hooks/useApproveSubmission";

import SubmissionInfo from "../SubmissionInfo/SubmissionInfo";
import FormInput from "../../Submit/FormInput/FormInput";
import ImageInput from "../../Submit/ImageInput/ImageInput";
import FormCheckbox from "../../Submit/FormCheckbox/FormCheckbox";
import FormSection from "../../Submit/FormSection/FormSection";
import FormSelector from "../../Submit/FormSelector/FormSelector";
import AudioInput from "../../Submit/AudioInput/AudioInput";
import styles from "./ApprovalsForm.module.css";

export default function ApprovalsForm({ submission, onUpdate }) {
  const [isSingle, setIsSingle] = useState(submission.data.single === "yes");
  const formRef = useRef(null);

  const {
    artists,
    synths,
    addArtist,
    removeArtist,
    addSynth,
    removeSynth,
    addPreset,
    removePreset,
    setArtists,
    setSynths,
  } = useSubmitForm();

  const { isProcessing, error, handleApprove, handleDeny } =
    useApproveSubmission();

  useEffect(() => {
    if (submission.data.artists) {
      setArtists(
        submission.data.artists.map((artist, index) => ({
          id: `artist-${submission.id}-${index}`,
          ...artist,
        }))
      );
    }
    if (submission.data.synths) {
      setSynths(
        submission.data.synths.map((synth, index) => ({
          id: `synth-${submission.id}-${index}`,
          presets: synth.presets?.map((preset, presetIndex) => ({
            id: `preset-${submission.id}-${index}-${presetIndex}`,
            ...preset,
          })) || [{ id: `preset-${submission.id}-${index}-0` }],
          ...synth,
        }))
      );
    }
  }, [submission.data, setArtists, setSynths]);

  const handleSingleChange = (checked) => {
    setIsSingle(checked);
  };

  const handleApproveSubmission = async (e) => {
    e.preventDefault();
    if (formRef.current) {
      await handleApprove(formRef.current, submission.id, onUpdate);
    }
  };

  const handleDenySubmission = async () => {
    await handleDeny(submission.id, onUpdate);
  };

  return (
    <div id={`entry-${submission.id}`} className={styles.submissionContainer}>
      <h2 className={styles.headingSecondary}>User Submission</h2>
      <SubmissionInfo submission={submission} />

      <form
        ref={formRef}
        onSubmit={handleApproveSubmission}
        encType="multipart/form-data"
        className={styles.approvalsForm}
      >
        <input type="hidden" name="entryId" value={submission.id} />

        <legend className={styles.legend}>Song Information</legend>
        <fieldset className={styles.fieldset}>
          <FormSection type="songTitle" className={styles.formSection}>
            <FormInput
              required
              type="text"
              id="songTitle"
              label="Song Title"
              defaultValue={submission.data.songTitle || ""}
            >
              Provide the full title of the song. Do not include featured
              artists or producers.
            </FormInput>

            <FormInput
              required
              type="text"
              id="songGenre"
              label="Genre"
              defaultValue={submission.data.songGenre || ""}
            >
              Specify the music genre (e.g., Trap, House, Hip Hop).
            </FormInput>

            <FormInput
              required
              type="number"
              id="songYear"
              label="Release Year"
              defaultValue={submission.data.songYear || ""}
            >
              Enter the year the song was released (e.g., 2018).
            </FormInput>

            <FormInput
              required
              type="url"
              id="songUrl"
              label="Song URL"
              defaultValue={submission.data.songUrl || ""}
            >
              Paste the YouTube URL of the song. Use the official artist's
              channel. Avoid music videos unless no official audio uploads
              exist.
            </FormInput>

            <ImageInput
              label="Cover Image"
              id="songImg"
              required={isSingle}
              initialImage={submission.data.songImg}
              isApprovalMode={true}
              isFilled={submission.data.songFilled}
            >
              Upload the song's cover image. Leave blank to default to the album
              cover. Minimum dimensions: 1000 x 1000 pixels.
            </ImageInput>
          </FormSection>
        </fieldset>

        <legend className={styles.legend}>Artist Information</legend>
        <fieldset className={styles.fieldset}>
          {artists.map((artist, index) => (
            <FormSection
              key={`artist-${index}`}
              type="artistName"
              className={styles.formSection}
            >
              {index > 0 && (
                <>
                  <hr className={styles.hrSep} />
                  <div className={styles.entryNewHeader}>
                    <span className={styles.entryNewText}>
                      Additional Artist
                    </span>
                    <FaXmark
                      className={styles.entryDeleteBtn}
                      onClick={() => removeArtist(index)}
                    />
                  </div>
                </>
              )}

              <FormInput
                required
                type="text"
                id={`artists[${index}][name]`}
                label="Artist Name"
                defaultValue={artist.name || ""}
              >
                Enter the name of the artist.
              </FormInput>

              <FormInput
                required
                type="text"
                id={`artists[${index}][country]`}
                label="Artist Country"
                defaultValue={artist.country || ""}
              >
                Specify the artist's country of origin.
              </FormInput>

              <FormInput
                required
                type="text"
                id={`artists[${index}][role]`}
                label="Artist Role"
                defaultValue={artist.role || ""}
              >
                State the artist's role on the track. Use 'Main' for primary
                artist. Enter only one role.
              </FormInput>

              <ImageInput
                label="Artist Image"
                id={`artists[${index}][img]`}
                required
                initialImage={artist.img}
                isApprovalMode={true}
                isFilled={artist.filled}
              >
                Upload the artist's image. Minimum dimensions: 1000 x 1000
                pixels.
              </ImageInput>
            </FormSection>
          ))}

          <button type="button" className={styles.addBtn} onClick={addArtist}>
            + Add Another Artist
          </button>
        </fieldset>

        <legend className={styles.legend}>Album Information</legend>
        <fieldset className={styles.fieldset}>
          <FormSection type="albumTitle" className={styles.formSection}>
            <FormCheckbox
              id="single"
              checked={isSingle}
              onChange={handleSingleChange}
            >
              Check this box if the song is a single (doesn't appear on any
              albums besides possibly compilation albums).
            </FormCheckbox>

            <FormInput
              required={!isSingle}
              disabled={isSingle}
              type="text"
              id="albumTitle"
              label="Album Title"
              defaultValue={submission.data.albumTitle || ""}
            >
              Provide the album's title.
            </FormInput>

            <FormInput
              required={!isSingle}
              disabled={isSingle}
              type="text"
              id="albumGenre"
              label="Genre"
              defaultValue={submission.data.albumGenre || ""}
            >
              Indicate the album's genre.
            </FormInput>

            <FormInput
              required={!isSingle}
              disabled={isSingle}
              type="number"
              id="albumYear"
              label="Release Year"
              defaultValue={submission.data.albumYear || ""}
            >
              Enter the year the album was released.
            </FormInput>

            <ImageInput
              label="Album Cover"
              id="albumImg"
              required={!isSingle}
              disabled={isSingle}
              initialImage={submission.data.albumImg}
              isApprovalMode={true}
              isFilled={submission.data.albumFilled}
            >
              Upload the album's cover image. Minimum dimensions: 1000 x 1000
              pixels.
            </ImageInput>
          </FormSection>
        </fieldset>

        <legend className={styles.legend}>Preset Information</legend>
        <fieldset className={styles.fieldset}>
          {synths.map((synth, synthIndex) => (
            <div key={`synth-${synthIndex}`} className={styles.synthSection}>
              {synthIndex > 0 && (
                <div className={styles.entryNewHeader}>
                  <span className={styles.entryNewText}>Additional Synth</span>
                  <FaXmark
                    className={styles.entryDeleteBtn}
                    onClick={() => removeSynth(synthIndex)}
                  />
                </div>
              )}

              <FormSection type="synthName" className={styles.formSection}>
                <FormInput
                  required
                  type="text"
                  id={`synths[${synthIndex}][name]`}
                  label="Synth Name"
                  defaultValue={synth.name || ""}
                >
                  Name the synth used in the track.
                </FormInput>

                <FormInput
                  required
                  type="text"
                  id={`synths[${synthIndex}][manufacturer]`}
                  label="Manufacturer"
                  defaultValue={synth.manufacturer || ""}
                >
                  Provide the manufacturer or developer (e.g., Spectrasonics)
                </FormInput>

                <FormInput
                  required
                  type="number"
                  id={`synths[${synthIndex}][year]`}
                  label="Release Year"
                  defaultValue={synth.year || ""}
                >
                  Enter the synth's release year.
                </FormInput>

                <FormSelector
                  label="Synth Type"
                  id={`synths[${synthIndex}][type]`}
                  required
                  defaultValue={synth.type || ""}
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

                <ImageInput
                  label="Synth Image"
                  id={`synths[${synthIndex}][img]`}
                  required
                  initialImage={synth.img}
                  isApprovalMode={true}
                  isFilled={synth.filled}
                >
                  Upload an image of the synth. Minimum dimensions: 1000 x 1000
                  pixels.
                </ImageInput>
              </FormSection>

              <hr className={styles.hrSep} />

              {synth.presets?.map((preset, presetIndex) => (
                <FormSection
                  key={`synth-${synthIndex}-preset-${presetIndex}`}
                  type="presetName"
                  className={styles.formSection}
                >
                  {presetIndex > 0 && (
                    <>
                      <hr className={styles.hrSep} />
                      <div className={styles.entryNewHeader}>
                        <span className={styles.entryNewText}>
                          Additional Preset
                        </span>
                        <FaXmark
                          className={styles.entryDeleteBtn}
                          onClick={() => removePreset(synthIndex, presetIndex)}
                        />
                      </div>
                    </>
                  )}

                  <FormInput
                    required
                    type="text"
                    id={`synths[${synthIndex}][presets][${presetIndex}][name]`}
                    label="Preset Name"
                    defaultValue={preset.name || ""}
                  >
                    Enter the full name of the exact preset used (e.g., 2
                    Sparklepad BT, LD King of Buzz 2).
                  </FormInput>

                  <FormInput
                    required
                    type="text"
                    id={`synths[${synthIndex}][presets][${presetIndex}][packName]`}
                    label="Pack Name"
                    defaultValue={preset.packName || ""}
                  >
                    Provide the name of the preset pack. Leave blank for
                    built-in presets.
                  </FormInput>

                  <FormInput
                    required
                    type="text"
                    id={`synths[${synthIndex}][presets][${presetIndex}][author]`}
                    label="Preset Author"
                    defaultValue={preset.author || ""}
                  >
                    Identify who created the preset or preset pack. Leave blank
                    for manufacturer, for factory presets.
                  </FormInput>

                  <FormInput
                    type="text"
                    id={`synths[${synthIndex}][presets][${presetIndex}][usageType]`}
                    required
                    label="Usage Type"
                    defaultValue={preset.usageType || ""}
                  >
                    Describe how the preset was used (e.g., Lead, Pad,
                    Sequence).
                  </FormInput>

                  <AudioInput
                    required
                    label="Preset Audio"
                    id={`synths[${synthIndex}][presets][${presetIndex}][audio]`}
                    initialAudio={preset.audio}
                    isApprovalMode={true}
                  >
                    Upload a short <kbd>.mp3</kbd> audio clip (approximately 4
                    bars) demonstrating how the preset is used in the song.
                  </AudioInput>
                </FormSection>
              ))}

              <button
                type="button"
                className={styles.addBtn}
                onClick={() => addPreset(synthIndex)}
              >
                + Add Another Preset
              </button>
            </div>
          ))}

          <hr className={styles.hrBtns} />

          <button type="button" className={styles.addBtn} onClick={addSynth}>
            + Add Another Synth
          </button>
        </fieldset>

        {error && <div className={styles.errorMessage}>Error: {error}</div>}

        <div className={styles.btnContainer}>
          <button
            className={styles.denyBtn}
            type="button"
            onClick={handleDenySubmission}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Deny"}
          </button>
          <button
            className={styles.approveBtn}
            type="submit"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Approve"}
          </button>
        </div>
      </form>
    </div>
  );
}
