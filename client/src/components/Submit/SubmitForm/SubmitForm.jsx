import { useState, useRef } from "react";
import { Link } from "react-router-dom";

import { submitData } from "../../../api/api";
import { uploadEntry } from "../../../api/admin";
import { useSubmitForm } from "../../../hooks/useSubmitForm";
import { useAuth } from "../../../contexts/AuthContext";

import FormInput from "../FormInput/FormInput";
import FormInputAutofill from "../FormInputAutofill/FormInputAutofill";
import ImageInput from "../ImageInput/ImageInput";
import FormCheckbox from "../FormCheckbox/FormCheckbox";
import FormSection from "../FormSection/FormSection";
import ArtistSection from "../ArtistSection/ArtistSection";
import SynthSection from "../SynthSection/SynthSection";
import styles from "./SubmitForm.module.css";

export default function SubmitForm({
  onSubmitSuccess,
  onSubmitError,
  mode = "submit",
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSingle, setIsSingle] = useState(false);

  const songImageRef = useRef(null);
  const albumImageRef = useRef(null);

  const { isAuthenticated, user, loading } = useAuth();

  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
  };

  const clearForm = (form) => {
    form.reset();
    setArtists([{ id: Date.now() }]);
    setSynths([{ id: Date.now(), presets: [{ id: Date.now() }] }]);
    setIsSingle(false);

    window.dispatchEvent(new CustomEvent("resetImageInputs"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = collectFormData(e.target);

      if (mode === "submit") {
        await submitData(formData);
      } else if (mode === "upload") {
        await uploadEntry(formData);
      }

      // Reset form
      clearForm(e.target);

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError(error.message);

      if (onSubmitError) {
        onSubmitError(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.submitFormContainer}>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        ref={(formRef) => (SubmitForm.formRef = formRef)}
      >
        <input type="hidden" name="userId" value={user ? user.id : ""} />
        <legend className={styles.legend}>Song Information</legend>
        <fieldset className={styles.fieldset}>
          <FormSection type="songTitle" className={styles.formSection}>
            <FormInputAutofill
              required
              type="text"
              id="songTitle"
              label="Song Title"
              autofillType="songTitle"
              autofillSection
            >
              Provide the full title of the song. Do not include featured
              artists or producers.
            </FormInputAutofill>

            <FormInputAutofill
              required
              type="text"
              id="songGenre"
              label="Genre"
              autofillType="genre"
            >
              Specify the music genre (e.g., Trap, House, Hip Hop).
            </FormInputAutofill>

            <FormInput
              required
              type="number"
              id="songYear"
              label="Release Year"
              dataKey="songYear"
            >
              Enter the year the song was released (e.g., 2018).
            </FormInput>

            <FormInput
              required
              type="url"
              id="songUrl"
              label="Song URL"
              dataKey="songUrl"
            >
              Paste the YouTube URL of the song. Use the official artist's
              channel. Avoid music videos unless no official audio uploads
              exist.
            </FormInput>

            <ImageInput
              ref={songImageRef}
              label="Cover Image"
              id="songImg"
              dataKey="songImg"
              required={isSingle}
            >
              Upload the song's cover image. Leave blank to default to the album
              cover. Minimum dimensions: 1000 x 1000 pixels.
            </ImageInput>
          </FormSection>
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
          <FormSection type="albumTitle" className={styles.formSection}>
            <FormCheckbox
              id="single"
              checked={isSingle}
              onChange={handleSingleChange}
            >
              Check this box if the song is a single (doesn't appear on any
              albums besides possibly compilation albums).
            </FormCheckbox>

            <FormInputAutofill
              required={!isSingle}
              disabled={isSingle}
              type="text"
              id="albumTitle"
              label="Album Title"
              autofillType="albumTitle"
              autofillSection
            >
              Provide the album's title.
            </FormInputAutofill>

            <FormInputAutofill
              required={!isSingle}
              disabled={isSingle}
              type="text"
              id="albumGenre"
              label="Genre"
              autofillType="genre"
            >
              Indicate the album's genre.
            </FormInputAutofill>

            <FormInput
              required={!isSingle}
              disabled={isSingle}
              type="number"
              id="albumYear"
              label="Release Year"
              dataKey="albumYear"
            >
              Enter the year the album was released.
            </FormInput>

            <ImageInput
              ref={albumImageRef}
              label="Album Cover"
              id="albumImg"
              dataKey="albumImg"
              required={!isSingle}
              disabled={isSingle}
            >
              Upload the album's cover image. Minimum dimensions: 1000 x 1000
              pixels.
            </ImageInput>
          </FormSection>
        </fieldset>

        <legend className={styles.legend}>Preset Information</legend>
        <fieldset className={styles.fieldset}>
          {synths.map((synth, index) => (
            <SynthSection
              mode={mode}
              key={synth.id}
              index={index}
              synth={synth}
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
              {isSubmitting
                ? mode === "upload"
                  ? "Uploading..."
                  : "Submitting..."
                : mode === "upload"
                ? "Upload Entry"
                : "Submit Entry"}
            </button>
            <button
              className={styles.clearBtn}
              type="reset"
              onClick={() => clearForm(SubmitForm.formRef)}
            >
              Clear Form
            </button>
          </div>
          {mode === "submit" && (
            <Link to="/upload-tos" className={styles.submitTosText}>
              Please ensure you have read and understood the Upload Terms of
              Service before submitting.
            </Link>
          )}
        </div>
      </form>
    </section>
  );
}
