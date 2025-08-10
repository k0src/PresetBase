import { useState, useRef } from "react";
import placeholderImage from "../../../assets/images/image-upload-placeholder.webp";
import styles from "./ImageInput.module.css";
import classNames from "classnames";

export default function ImageInput({
  label,
  id,
  children,
  required,
  disabled,
  options = { minImgSize: 1000, maxImgSize: 5000 },
}) {
  const [fileName, setFileName] = useState("No file selected.");
  const [imageSrc, setImageSrc] = useState(placeholderImage);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    if (disabled) return;

    const file = event.target.files[0];
    if (!file) {
      setFileName("No file selected.");
      setImageSrc(placeholderImage);
      return;
    }

    // Validate image
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onerror = () => {
      alert("Invalid image file.");
      setFileName("No file selected.");
      setImageSrc(placeholderImage);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      URL.revokeObjectURL(objectUrl);
    };

    img.onload = () => {
      const { minImgSize } = options;

      if (img.width < minImgSize || img.height < minImgSize) {
        alert(`Image must be at least ${minImgSize} x ${minImgSize} pixels.`);
        setFileName("No file selected.");
        setImageSrc(placeholderImage);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        // Update display if file is valid
        setFileName(file.name);
        setImageSrc(objectUrl);
      }

      // Don't revoke URL immediately if image is valid
      if (img.width < minImgSize || img.height < minImgSize) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  };

  const handleBrowseClick = () => {
    if (disabled) return;

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={styles.label}>
      <span>
        {label} {required && <span className={styles.red}>*</span>}
      </span>
      <div className={styles.imageInputContainer}>
        <img
          src={imageSrc}
          alt="Uploaded Image"
          className={styles.imageDisplay}
        />
        <div className={styles.imageInputWrapper}>
          <div
            className={classNames(styles.customImageInput, {
              [styles.disabled]: disabled,
            })}
          >
            <button
              className={styles.button}
              type="button"
              onClick={handleBrowseClick}
              disabled={disabled}
            >
              Browse...
            </button>
            <span className={styles.fileName}>{fileName}</span>
            <input
              ref={fileInputRef}
              className={styles.input}
              type="file"
              name={id}
              accept="image/*"
              required={required && !disabled}
              disabled={disabled}
              onChange={handleFileChange}
            />
          </div>
          <small className={styles.small}>{children}</small>
        </div>
      </div>
    </div>
  );
}
