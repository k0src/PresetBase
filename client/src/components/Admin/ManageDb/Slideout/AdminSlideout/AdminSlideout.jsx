import { memo, useEffect, useRef } from "react";

import { useSlideoutData } from "../../../../../hooks/useSlideoutData";
import { slideoutConfigs } from "../slideoutConfigs";

import SlideoutInfoSection from "../SlideoutInfoSection/SlideoutInfoSection";
import SlideoutInputSection from "../SlideoutInputSection/SlideoutInputSection";
import ComponentLoader from "../../../../ComponentLoader/ComponentLoader";

import styles from "./AdminSlideout.module.css";
import classNames from "classnames";

import { FaXmark } from "react-icons/fa6";

const AdminSlideout = memo(function AdminSlideout({ onUpdate, onDelete }) {
  const {
    isOpen,
    entryType,
    data,
    loading,
    error,
    hasChanges,
    closeSlideout,
    updateEntryData,
    deleteEntryData,
  } = useSlideoutData();

  const slideoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (slideoutRef.current && !slideoutRef.current.contains(e.target)) {
        closeSlideout();
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
  }, [isOpen, closeSlideout]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        closeSlideout();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeSlideout]);

  const handleApplyChanges = async (e) => {
    try {
      e.preventDefault();
      const formData = new FormData(e.target);
      await updateEntryData(formData);
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error("Error applying changes:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEntryData();
      if (onDelete) {
        onDelete();
      }
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  const config = slideoutConfigs[entryType];

  return isOpen ? (
    <>
      <div className={styles.backdrop} />
      <aside
        ref={slideoutRef}
        className={classNames(styles.slideout, {
          [styles.slideoutOpen]: isOpen,
        })}
      >
        <header className={styles.header}>
          <h2 className={styles.headingSecondary}>
            {config?.title || "Edit Entry"}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={closeSlideout}
          >
            <FaXmark />
          </button>
        </header>

        <form
          encType="multipart/form-data"
          onSubmit={handleApplyChanges}
          className={styles.content}
        >
          {loading ? (
            <ComponentLoader />
          ) : error ? (
            <div className={styles.error}>
              <p>Error loading entry data: {error}</p>
            </div>
          ) : data && config ? (
            <>
              <div className={styles.entryInfo}>
                <SlideoutInfoSection
                  entryType={entryType}
                  data={data}
                  config={config}
                />
                <SlideoutInputSection
                  entryType={entryType}
                  data={data}
                  config={config}
                />
              </div>

              <hr className={styles.hr} />

              <div className={styles.actions}>
                <div className={styles.actionsBtns}>
                  <button
                    type="submit"
                    className={classNames(styles.applyChangesBtn, {
                      [styles.disabled]: !hasChanges,
                    })}
                    disabled={!hasChanges}
                  >
                    Apply Changes
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={handleDelete}
                  >
                    Delete Entry
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </form>
      </aside>
    </>
  ) : null;
});

export default AdminSlideout;
