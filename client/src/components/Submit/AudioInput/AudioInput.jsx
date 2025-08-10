import { useState, useRef } from "react";
import styles from "./AudioInput.module.css";
import { FaCirclePlay, FaCircleStop } from "react-icons/fa6";
import { useAudioPlayer } from "../../../hooks/useAudioPlayer";

export default function AudioInput({
  label,
  id,
  children,
  required,
  options = { minAudioDuration: 0, maxAudioDuration: 120 },
}) {
  const [fileName, setFileName] = useState("No file selected.");
  const [audioFile, setAudioFile] = useState(null);
  const fileInputRef = useRef(null);

  const { playingAudio, handleAudioToggle, addAudioSource, removeAudioSource } =
    useAudioPlayer();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setFileName("No file selected.");
      if (audioFile) {
        removeAudioSource(id);
        setAudioFile(null);
      }
      return;
    }

    // Validate audio
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
        // Update display and add to audio player
        setFileName(file.name);
        setAudioFile(objectUrl);
        addAudioSource(id, objectUrl);
      }
    };
  };

  const handleBrowseClick = () => {
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
        <div className={styles.customAudioInput}>
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
            accept="audio/mpeg"
            required={required || false}
            onChange={handleFileChange}
          />
        </div>
      </div>
      <small className={styles.small}>{children}</small>
    </div>
  );
}
