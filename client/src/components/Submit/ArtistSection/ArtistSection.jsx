import FormInput from "../FormInput/FormInput";
import ImageInput from "../ImageInput/ImageInput";
import styles from "../SubmitForm/SubmitForm.module.css";

import { FaXmark } from "react-icons/fa6";

export default function ArtistSection({ index, onRemove }) {
  const handleRemove = () => {
    onRemove(index);
  };

  return (
    <div className={styles.formSection}>
      {index > 0 && (
        <>
          <hr className={styles.hrSep} />
          <div className={styles.entryNewHeader}>
            <span className={styles.entryNewText}>Additional Artist</span>
            <FaXmark className={styles.entryDeleteBtn} onClick={handleRemove} />
          </div>
        </>
      )}

      <FormInput
        required
        type="text"
        id={`artists[${index}][name]`}
        autofill
        label="Artist Name"
      >
        Enter the name of the artist.
      </FormInput>

      <FormInput
        required
        type="text"
        id={`artists[${index}][country]`}
        autofill
        label="Artist Country"
      >
        Specify the artist's country of origin.
      </FormInput>

      <FormInput
        required
        type="text"
        id={`artists[${index}][role]`}
        autofill
        label="Artist Role"
      >
        State the artist's role on the track. Use 'Main' for primary artist.
        Enter only one role.
      </FormInput>

      <ImageInput label="Artist Image" id={`artists[${index}][img]`} required>
        Upload the artist's image. Minimum dimensions: 1000 x 1000 pixels.
      </ImageInput>
    </div>
  );
}
