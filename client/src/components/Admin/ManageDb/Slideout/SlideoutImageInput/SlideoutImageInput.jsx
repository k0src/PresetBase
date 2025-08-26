import { useState, useRef, forwardRef, useEffect } from "react";

import placeholderImage from "../../../../../assets/images/image-upload-placeholder.webp";
import styles from "./SlideoutImageInput.module.css";

const SlideoutImageInput = forwardRef(function SlideoutImageInput({
  initalImage = null,
  label,
  id,
  required,
}) {
  const [fileName, setFileName] = useState("No file selected.");
  const [imageSrc, setImageSrc] = useState(placeholderImage);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initalImage && initalImage.trim()) {
      setImageSrc(`/uploads/images/approved/${initalImage}`);
      setFileName(initalImage);
    }
  }, [initalImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFileName("No file selected.");
      setImageSrc(placeholderImage);
      return;
    }

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
      setFileName(file.name);
      setImageSrc(objectUrl);
    };
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={styles.slideoutImageInputContainer}>
      <span className={styles.labelText}>{label}</span>

      <div className={styles.imageInputContainer}>
        <img
          src={imageSrc}
          alt={fileName}
          className={styles.imageDisplay}
          loading="lazy"
        />
        <div className={styles.imageInputWrapper}>
          <div className={styles.customImageInput}>
            <button
              className={styles.button}
              type="button"
              onClick={handleBrowseClick}
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
              required={required || false}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default SlideoutImageInput;
