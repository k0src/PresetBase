import styles from "./ImageInput.module.css";

export default function ImageInputStatic({
  label,
  children,
  imageSrc,
  required,
  fileName = "No file selected",
  altText = "Uploaded Image",
}) {
  return (
    <div className={styles.label}>
      <span>
        {label} {required && <span className={styles.red}>*</span>}
      </span>
      <div className={styles.imageInputContainer}>
        <img src={imageSrc} alt={altText} className={styles.imageDisplay} />
        <div className={styles.imageInputWrapper}>
          <div className={styles.customImageInput}>
            <button className={styles.button} type="button" disabled>
              Browse...
            </button>
            <span className={styles.fileName}>{fileName}</span>
            <input
              className={styles.input}
              type="file"
              accept="image/*"
              disabled
            />
          </div>
          <small className={styles.small}>{children}</small>
        </div>
      </div>
    </div>
  );
}
