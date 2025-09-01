import { useEffect, useRef } from "react";
import styles from "./DeleteModal.module.css";

export default function DeleteModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  loadingText = "Processing...",
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.classList.add("noScroll");
      document.documentElement.classList.add("noScroll");
    } else {
      document.body.classList.remove("noScroll");
      document.documentElement.classList.remove("noScroll");
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.classList.remove("noScroll");
      document.documentElement.classList.remove("noScroll");
    };
  }, [isOpen, onCancel]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className={styles.confirmDialog}>
      <div className={styles.confirmContent} ref={modalRef}>
        <h3 className={styles.confirmContentTitle}>{title}</h3>
        <span className={styles.confirmContentText}>{message}</span>
        <div className={styles.confirmButtons}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={styles.confirmDeleteBtn}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
