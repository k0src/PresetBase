import {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import placeholderImage from "../../../assets/images/image-upload-placeholder.webp";
import styles from "./ImageInput.module.css";
import classNames from "classnames";

const ImageInput = forwardRef(function ImageInput(
  {
    label,
    id,
    children,
    required,
    disabled,
    dataKey,
    initialImage = null,
    isApprovalMode = false,
    isFilled = false,
    options = { minImgSize: 1000, maxImgSize: 5000 },
  },
  ref
) {
  const [fileName, setFileName] = useState("No file selected.");
  const [imageSrc, setImageSrc] = useState(placeholderImage);
  const [isAutofilled, setIsAutofilled] = useState(false);
  const [autofilledValue, setAutofilledValue] = useState("");
  const fileInputRef = useRef(null);
  const hiddenInputRef = useRef(null);

  useEffect(() => {
    if (initialImage && isApprovalMode && initialImage.trim()) {
      let imagePath;
      if (initialImage.startsWith("/uploads/")) {
        imagePath = initialImage;
      } else {
        const folder = isFilled ? "approved" : "pending";
        imagePath = `/uploads/images/${folder}/${initialImage}`;
      }

      setImageSrc(imagePath);
      setFileName("Uploaded Image");
      setIsAutofilled(true);
      setAutofilledValue(initialImage);
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = initialImage;
      }
    }
  }, [initialImage, isApprovalMode, isFilled]);

  const resetComponent = () => {
    if (!isApprovalMode) {
      setFileName("No file selected.");
      setImageSrc(placeholderImage);
      setIsAutofilled(false);
      setAutofilledValue("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    const handleReset = () => {
      resetComponent();
    };

    const handleAutofillImage = (e) => {
      const { input, imageUrl } = e.detail;
      if (input === fileInputRef.current && imageUrl) {
        setImageSrc(`/uploads/images/approved/${imageUrl}`);
        setFileName("Autofilled Image");
        setIsAutofilled(true);
        setAutofilledValue(imageUrl);
        if (hiddenInputRef.current) {
          hiddenInputRef.current.value = imageUrl;
        }
      }
    };

    window.addEventListener("resetImageInputs", handleReset);
    window.addEventListener("autofillImage", handleAutofillImage);

    return () => {
      window.removeEventListener("resetImageInputs", handleReset);
      window.removeEventListener("autofillImage", handleAutofillImage);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    reset: resetComponent,
  }));

  const handleFileChange = (e) => {
    if (disabled) return;

    const file = e.target.files[0];
    if (!file) {
      setFileName("No file selected.");
      setImageSrc(placeholderImage);
      return;
    }

    setIsAutofilled(false);
    setAutofilledValue("");
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = "";
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
      const { minImgSize } = options;

      if (img.width < minImgSize || img.height < minImgSize) {
        alert(`Image must be at least ${minImgSize} x ${minImgSize} pixels.`);
        setFileName("No file selected.");
        setImageSrc(placeholderImage);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setFileName(file.name);
        setImageSrc(objectUrl);
      }

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
          loading="lazy"
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
              data-key={dataKey}
              accept="image/*"
              required={required && !disabled && !isAutofilled}
              disabled={disabled}
              onChange={handleFileChange}
            />
            <input
              ref={hiddenInputRef}
              type="hidden"
              name={isAutofilled ? id : ""}
              value={autofilledValue}
            />
          </div>
          <small className={styles.small}>{children}</small>
        </div>
      </div>
    </div>
  );
});

export default ImageInput;
