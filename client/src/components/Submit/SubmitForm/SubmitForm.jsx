import { useState } from "react";
import { Link } from "react-router-dom";

import { submitData } from "../../../api/api";
import { useSubmitForm } from "../../../hooks/useSubmitForm";

import FormInput from "../FormInput/FormInput";
import ImageInput from "../ImageInput/ImageInput";
import FormCheckbox from "../FormCheckbox/FormCheckbox";
import ArtistSection from "../ArtistSection/ArtistSection";
import SynthSection from "../SynthSection/SynthSection";
import styles from "./SubmitForm.module.css";

export default function SubmitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSingle, setIsSingle] = useState(false);

  const {
    artists,
    synths,
    addArtist,
    removeArtist,
    addSynth,
    removeSynth,
    addPreset,
    removePreset,
    collectFormData,
    setArtists,
    setSynths,
  } = useSubmitForm();

  const handleSingleChange = (checked) => {
    setIsSingle(checked);

    if (checked) {
      setArtists([{ id: Date.now() }]);
      setSynths([{ id: Date.now(), presets: [{ id: Date.now() }] }]);
    } else {
      setArtists([{ id: Date.now() }]);
      setSynths([{ id: Date.now(), presets: [{ id: Date.now() }] }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = collectFormData(e.target);

      await submitData(formData);

      e.target.reset();
      setArtists([{ id: Date.now() }]);
      setSynths([{ id: Date.now(), presets: [{ id: Date.now() }] }]);
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
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
              id="songTitle"
              autofill
              label="Song Title"
            >
              Provide the full title of the song. Do not include featured
              artists or producers.
            </FormInput>

            <FormInput
              required
              type="text"
              id="songGenre"
              autofill
              label="Genre"
            >
              Specify the music genre (e.g., Trap, House, Hip Hop).
            </FormInput>

            <FormInput
              required
              type="number"
              id="songYear"
              label="Release Year"
            >
              Enter the year the song was released (e.g., 2018).
            </FormInput>

            <FormInput required type="url" id="songUrl" label="Song URL">
              Paste the YouTube URL of the song. Use the official artist's
              channel. Avoid music videos unless no official audio uploads
              exist.
            </FormInput>

            <ImageInput label="Cover Image" id="songImg" required={isSingle}>
              Upload the song's cover image. Leave blank to default to the album
              cover. Minimum dimensions: 1000 x 1000 pixels.
            </ImageInput>
          </div>
        </fieldset>

        <legend className={styles.legend}>Artist Information</legend>
        <fieldset className={styles.fieldset}>
          {artists.map((artist, index) => (
            <ArtistSection
              key={artist.id}
              index={index}
              onRemove={removeArtist}
            />
          ))}

          <button type="button" className={styles.addBtn} onClick={addArtist}>
            + Add Another Artist
          </button>
        </fieldset>

        <legend className={styles.legend}>Album Information</legend>
        <fieldset className={styles.fieldset}>
          <div className={styles.formSection}>
            <FormCheckbox
              id="single"
              checked={isSingle}
              onChange={handleSingleChange}
            >
              Check this box if the song is a single (doesn't appear on any
              albums besides possibly compilation albums).
            </FormCheckbox>

            <FormInput
              required={!isSingle} // Not required when single is checked
              disabled={isSingle} // Disabled when single is checked
              type="text"
              id="albumTitle"
              autofill
              label="Album Title"
            >
              Provide the album's title.
            </FormInput>

            <FormInput
              required={!isSingle}
              disabled={isSingle}
              type="text"
              id="albumGenre"
              autofill
              label="Genre"
            >
              Indicate the album's genre.
            </FormInput>

            <FormInput
              required={!isSingle}
              disabled={isSingle}
              type="number"
              id="albumYear"
              label="Release Year"
            >
              Enter the year the album was released.
            </FormInput>

            <ImageInput
              label="Album Image"
              id="albumImg"
              required={!isSingle}
              disabled={isSingle}
            >
              Upload the album's cover image. Minimum dimensions: 1000 x 1000
              pixels.
            </ImageInput>
          </div>
        </fieldset>

        <legend className={styles.legend}>Preset Information</legend>
        <fieldset className={styles.fieldset}>
          {synths.map((synth, index) => (
            <SynthSection
              key={synth.id}
              index={index}
              presets={synth.presets}
              onRemove={removeSynth}
              onAddPreset={addPreset}
              onRemovePreset={removePreset}
            />
          ))}

          <hr className={styles.hrBtns} />

          <button type="button" className={styles.addBtn} onClick={addSynth}>
            + Add Another Synth
          </button>
        </fieldset>

        {submitError && (
          <div className={styles.errorMessage}>Error: {submitError}</div>
        )}

        <div className={styles.submitFooter}>
          <div className={styles.btnContainer}>
            <button
              className={styles.submitBtn}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Entry"}
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
