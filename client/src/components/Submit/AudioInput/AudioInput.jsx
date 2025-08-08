import styles from "./AudioInput.module.css";
import { FaCirclePlay, FaCircleStop } from "react-icons/fa6";

export default function AudioInput({
  label,
  id,
  children,
  required,
  options = { minAudioDuration: 0, maxAudioDuration: 120 },
}) {
  return (
    <label className={styles.label}>
      {label} {required && <span className={styles.red}>*</span>}
      <div className={styles.audioInputContainer}>
        <div className={styles.audioBtnContainer}>
          <FaCirclePlay className={styles.audioBtn} />
        </div>
        <audio src={null}></audio>
        <div className={styles.customAudioInput}>
          <button className={styles.button} type="button">
            Browse...
          </button>
          <span className={styles.fileName}>No file selected.</span>
          <input
            className={styles.input}
            type="file"
            name={id}
            accept="audio/mpeg"
            required={required || false}
          />
        </div>
      </div>
      <small className={styles.small}>{children}</small>
    </label>
  );
}
