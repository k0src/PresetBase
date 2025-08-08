import { Link } from "react-router-dom";

import FormInput from "../FormInput/FormInput";
import ImageInput from "../ImageInput/ImageInput";
import AudioInput from "../AudioInput/AudioInput";
import FormCheckbox from "../FormCheckbox/FormCheckbox";
import FormSelector from "../FormSelector/FormSelector";
import styles from "./SubmitForm.module.css";

export default function SubmitForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <section className={styles.submitFormContainer}>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <legend className={styles.legend}>Song Information</legend>
        <fieldset className={styles.fieldset}>
          <div className={styles.formSection}>
            <FormInput
              required
              type="text"
              id="song.title"
              autofill
              label="Song Title"
            >
              Provide the full title of the song. Do not include featured
              artists or producers.
            </FormInput>

            <FormInput
              required
              type="text"
              id="song.genre"
              autofill
              label="Genre"
            >
              Specify the music genre (e.g., Trap, House, Hip Hop).
            </FormInput>

            <FormInput
              required
              type="number"
              id="song.year"
              label="Release Year"
            >
              Enter the year the song was released (e.g., 2018).
            </FormInput>

            <FormInput required type="url" id="song.songUrl" label="Song URL">
              Paste the YouTube URL of the song. Use the official artist's
              channel. Avoid music videos unless no official audio uploads
              exist.
            </FormInput>

            <ImageInput label="Cover Image" id="song.imageUrl">
              Upload the song's cover image. Leave blank to default to the album
              cover. Minimum dimensions: 1000 x 1000 pixels.
            </ImageInput>
          </div>
        </fieldset>

        <legend className={styles.legend}>Artist Information</legend>
        <fieldset className={styles.fieldset}>
          <div className={styles.formSection}>
            <FormInput
              required
              type="text"
              id="artist[0][name]"
              autofill
              label="Artist Name"
            >
              Enter the name of the artist.
            </FormInput>

            <FormInput
              required
              type="text"
              id="artist[0][country]"
              autofill
              label="Artist Country"
            >
              Specify the artist's country of origin.
            </FormInput>

            <FormInput
              required
              type="text"
              id="artist[0][role]"
              autofill
              label="Artist Role"
            >
              State the artist's role on the track. Use 'Main' for primary
              artist. Enter only one role.
            </FormInput>

            <ImageInput label="Artist Image" id="artist[0][imageUrl]" required>
              Upload the artist's image. Minimum dimensions: 1000 x 1000 pixels.
            </ImageInput>
          </div>

          <button type="button" className={styles.addBtn}>
            + Add Another Artist
          </button>
        </fieldset>

        <legend className={styles.legend}>Album Information</legend>
        <fieldset className={styles.fieldset}>
          <div className={styles.formSection}>
            <FormCheckbox id="single">
              Check this box if the song is a single (doesn't appear on any
              albums besides possibly compilation albums).
            </FormCheckbox>

            <FormInput
              required
              type="text"
              id="album.title"
              autofill
              label="Album Title"
            >
              Provide the album's title.
            </FormInput>

            <FormInput
              required
              type="text"
              id="album.genre"
              autofill
              label="Genre"
            >
              Indicate the album's genre.
            </FormInput>

            <FormInput
              required
              type="number"
              id="album.year"
              label="Release Year"
            >
              Enter the year the album was released.
            </FormInput>

            <ImageInput label="Album Image" id="album.imageUrl" required>
              Upload the album's cover image. Minimum dimensions: 1000 x 1000
              pixels.
            </ImageInput>
          </div>
        </fieldset>

        <legend className={styles.legend}>Preset Information</legend>
        <fieldset className={styles.fieldset}>
          <div className={styles.synthSection}>
            <div className={styles.formSection}>
              <FormInput
                required
                type="text"
                id="synth[0][name]"
                autofill
                label="Synth Name"
              >
                Name the synth used in the track.
              </FormInput>

              <FormInput
                required
                type="text"
                id="synth[0][manufacturer]"
                autofill
                label="Manufacturer"
              >
                Provide the manufacturer or developer (e.g., Spectrasonics)
              </FormInput>

              <FormInput
                required
                type="number"
                id="synth[0][year]"
                label="Release Year"
              >
                Enter the synth's release year.
              </FormInput>

              <FormSelector
                label="Synth Type"
                id="synth[0][type]"
                required
                selectOptions={[
                  { value: "vst", label: "VST" },
                  { value: "hardware", label: "Hardware" },
                  { value: "kontakt", label: "Kontakt Bank" },
                  { value: "soundfont", label: "SoundFont" },
                  { value: "other", label: "Other" },
                ]}
              >
                Select the synth format.
              </FormSelector>

              <ImageInput label="Synth Image" id="synth.imageUrl" required>
                Upload an image of the synth. Minimum dimensions: 1000 x 1000
                pixels.
              </ImageInput>
            </div>

            <hr className={styles.hrSep} />

            <div className={styles.formSection}>
              <FormInput
                required
                type="text"
                id="synths[0][presets][0][name]"
                autofill
                label="Preset Name"
              >
                Enter the full name of the exact preset used (e.g., 2 Sparklepad
                BT, LD King of Buzz 2).
              </FormInput>

              <FormInput
                type="text"
                id="synths[0][presets][0][packName]"
                autofill
                label="Pack Name"
              >
                Provide the name of the preset pack. Leave blank for built-in
                presets.
              </FormInput>

              <FormInput
                type="text"
                id="synths[0][presets][0][author]"
                autofill
                label="Preset Author"
              >
                Identify who created the preset or preset pack. Leave blank for
                manufacturer, for factory presets.{" "}
                <Link to="/submit/info/preset-authors">
                  Where do I find preset authors?
                </Link>
              </FormInput>

              <FormInput
                type="text"
                id="synths[0][presets][0][usageType]"
                autofill
                required
                label="Usage Type"
              >
                Describe how the preset was used (e.g., Lead, Pad, Sequence).{" "}
                <Link to="/submit/info/preset-usage-types">
                  What do I enter for the usage type?
                </Link>
              </FormInput>

              <AudioInput
                label="Preset Audio (Optional)"
                id="synths[0]presets[0][audioUrl]"
              >
                Upload a short <kbd>.mp3</kbd> audio clip (approximately 4 bars)
                demonstrating how the preset is used in the song. The clip
                should feature the melody played{" "}
                <strong>without any external effects</strong>.{" "}
                <Link to="/submit/info/preset-audio">
                  How do I properly export preset audios?
                </Link>
              </AudioInput>
            </div>

            <button type="button" className={styles.addBtn}>
              + Add Another Preset
            </button>
          </div>

          <hr className={styles.hrBtns} />

          <button type="button" className={styles.addBtn}>
            + Add Another Synth
          </button>
        </fieldset>

        <div className={styles.submitFooter}>
          <div className={styles.btnContainer}>
            <button className={styles.submitBtn} type="submit">
              Submit Entry
            </button>
            <button className={styles.clearBtn} type="reset">
              Clear Form
            </button>
          </div>
          <Link to="/upload-tos" className={styles.submitTosText}>
            Please ensure you have read and understood the Upload Terms of
            Service before submitting.
          </Link>
        </div>
      </form>
    </section>
  );
}
