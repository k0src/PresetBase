import { memo } from "react";
import FormInputAutofill from "../FormInputAutofill/FormInputAutofill";
import ImageInput from "../ImageInput/ImageInput";
import FormSection from "../FormSection/FormSection";
import styles from "../SubmitForm/SubmitForm.module.css";

import { FaXmark } from "react-icons/fa6";

export default memo(function ArtistSection({ index, onRemove }) {
  const handleRemove = () => {
    onRemove(index);
  };

  return (
    <FormSection type="artistName" className={styles.formSection}>
      {index > 0 && (
        <>
          <hr className={styles.hrSep} />
          <div className={styles.entryNewHeader}>
            <span className={styles.entryNewText}>Additional Artist</span>
            <FaXmark className={styles.entryDeleteBtn} onClick={handleRemove} />
          </div>
        </>
      )}

      <FormInputAutofill
        required
        type="text"
        id={`artists[${index}][name]`}
        label="Artist Name"
        autofillType="artistName"
        autofillSection
      >
        Enter the name of the artist.
      </FormInputAutofill>

      <FormInputAutofill
        required
        type="text"
        id={`artists[${index}][country]`}
        label="Artist Country"
        autofillType="artistCountry"
      >
        Specify the artist's country of origin.
      </FormInputAutofill>

      <FormInputAutofill
        required
        type="text"
        id={`artists[${index}][role]`}
        label="Artist Role"
        autofillType="artistRole"
      >
        State the artist's role on the track. Use 'Main' for primary artist.
        Enter only one role.
      </FormInputAutofill>

      <ImageInput
        label="Artist Image"
        id={`artists[${index}][img]`}
        dataKey="artistImg"
        required
      >
        Upload the artist's image. Minimum dimensions: 1000 x 1000 pixels.
      </ImageInput>
    </FormSection>
  );
});
