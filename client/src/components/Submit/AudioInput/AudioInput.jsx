import { useState, useRef, useEffect } from "react";
import { useAudioPlayer } from "../../../hooks/useAudioPlayer";

import styles from "./AudioInput.module.css";
import classNames from "classnames";

import { FaCirclePlay, FaCircleStop } from "react-icons/fa6";

export default function AudioInput({
  label,
  id,
  children,
  required,
  disabled,
  initialAudio = null,
  isApprovalMode = false,
  options = { minAudioDuration: 0, maxAudioDuration: 120 },
}) {
  const [fileName, setFileName] = useState("No file selected.");
  const [audioFile, setAudioFile] = useState(null);
  const [isAutofilled, setIsAutofilled] = useState(false);
  const [autofilledValue, setAutofilledValue] = useState("");
  const fileInputRef = useRef(null);
  const hiddenInputRef = useRef(null);

  const { playingAudio, handleAudioToggle, addAudioSource, removeAudioSource } =
    useAudioPlayer();

  useEffect(() => {
    if (initialAudio && isApprovalMode && initialAudio.trim()) {
      let audioPath;
      if (initialAudio.startsWith("/uploads/")) {
        audioPath = initialAudio;
      } else {
        audioPath = `/uploads/audio/pending/${initialAudio}`;
      }

      setAudioFile(audioPath);
      setFileName("Uploaded Audio");
      setIsAutofilled(true);
      setAutofilledValue(initialAudio);
      addAudioSource(id, audioPath);
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = initialAudio;
      }
    }
  }, [initialAudio, isApprovalMode, id, addAudioSource]);

  const handleFileChange = (event) => {
    if (disabled) return;

    const file = event.target.files[0];
    if (!file) {
      setFileName("No file selected.");
      if (audioFile) {
        removeAudioSource(id);
        setAudioFile(null);
      }
      if (isAutofilled) {
        setIsAutofilled(false);
        setAutofilledValue("");
        if (hiddenInputRef.current) {
          hiddenInputRef.current.value = "";
        }
      }
      return;
    }

    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    audio.src = objectUrl;

    audio.onerror = () => {
      alert("Invalid audio file.");
      setFileName("No file selected.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      URL.revokeObjectURL(objectUrl);
    };

    audio.onloadedmetadata = () => {
      const { maxAudioDuration } = options;

      if (audio.duration > maxAudioDuration) {
        alert(`Audio file must be ${maxAudioDuration / 60} minutes or less.`);
        setFileName("No file selected.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        URL.revokeObjectURL(objectUrl);
      } else {
        setFileName(file.name);
        setAudioFile(objectUrl);
        addAudioSource(id, objectUrl);
        if (isAutofilled) {
          setIsAutofilled(false);
          setAutofilledValue("");
          if (hiddenInputRef.current) {
            hiddenInputRef.current.value = "";
          }
        }
      }
    };
  };

  const handleBrowseClick = () => {
    if (disabled) return;

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAudioPlay = () => {
    if (audioFile) {
      handleAudioToggle(id);
    }
  };

  return (
    <div className={styles.label}>
      <span>
        {label} {required && <span className={styles.red}>*</span>}
      </span>
      <div className={styles.audioInputContainer}>
        <div className={styles.audioBtnContainer}>
          {playingAudio === id ? (
            <FaCircleStop
              className={styles.audioBtn}
              onClick={handleAudioPlay}
              style={{
                cursor: audioFile ? "pointer" : "default",
                opacity: audioFile ? 1 : 0.5,
              }}
            />
          ) : (
            <FaCirclePlay
              className={styles.audioBtn}
              onClick={handleAudioPlay}
              style={{
                cursor: audioFile ? "pointer" : "default",
                opacity: audioFile ? 1 : 0.5,
              }}
            />
          )}
        </div>
        <audio src={audioFile}></audio>
        <div
          className={classNames(styles.customAudioInput, {
            [styles.disabled]: disabled,
          })}
        >
          <button
            className={styles.button}
            type="button"
            disabled={disabled}
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
            accept="audio/mpeg"
            disabled={disabled}
            required={required && !disabled && !isAutofilled}
            onChange={handleFileChange}
          />
          <input
            ref={hiddenInputRef}
            type="hidden"
            name={isAutofilled ? id : ""}
            value={autofilledValue}
          />
        </div>
      </div>
      <small className={styles.small}>{children}</small>
    </div>
  );
}
