import { useState, useRef, memo, useEffect } from "react";
import placeholderImage from "../../../../../assets/images/image-upload-placeholder.webp";
import styles from "./SlideoutImageInput.module.css";

const SlideoutImageInput = memo(function SlideoutImageInput({
  initialImage = null,
  label,
  id,
  onChange,
}) {
  const [fileName, setFileName] = useState("No file selected.");
  const [imageSrc, setImageSrc] = useState(placeholderImage);
  const [hasFile, setHasFile] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialImage && initialImage.trim()) {
      setImageSrc(`/uploads/images/approved/${initialImage}`);
      setFileName(initialImage);
      setHasFile(true);
    }
  }, [initialImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFileName("No file selected.");
      setImageSrc(placeholderImage);
      setHasFile(false);
      if (onChange) onChange();
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onerror = () => {
      alert("Invalid image file.");
      setFileName("No file selected.");
      setImageSrc(placeholderImage);
      setHasFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      URL.revokeObjectURL(objectUrl);
    };

    img.onload = () => {
      setFileName(file.name);
      setImageSrc(objectUrl);
      setHasFile(true);
      if (onChange) onChange();
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
              required={!hasFile}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default SlideoutImageInput;
