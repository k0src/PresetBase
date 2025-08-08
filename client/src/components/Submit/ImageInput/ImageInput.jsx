import placeholderImage from "../../../assets/images/image-upload-placeholder.webp";
import styles from "./ImageInput.module.css";

export default function ImageInput({
  label,
  id,
  children,
  required,
  options = { minImgSize: 1000, maxImgSize: 5000 },
}) {
  return (
    <label className={styles.label}>
      {label} {required && <span className={styles.red}>*</span>}
      <div className={styles.imageInputContainer}>
        <img
          src={placeholderImage}
          alt="Uploaded Image"
          className={styles.imageDisplay}
        />
        <div className={styles.imageInputWrapper}>
          <div className={styles.customImageInput}>
            <button className={styles.button} type="button">
              Browse...
            </button>
            <span className={styles.fileName}>No file selected.</span>
            <input
              className={styles.input}
              type="file"
              name={id}
              accept="image/*"
              required={required || false}
            />
          </div>
          <small className={styles.small}>{children}</small>
        </div>
      </div>
    </label>
  );
}
