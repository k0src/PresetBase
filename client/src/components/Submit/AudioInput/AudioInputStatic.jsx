import { useMemo } from "react";
import styles from "./AudioInput.module.css";
import { FaCirclePlay, FaCircleStop } from "react-icons/fa6";
import { useAudioPlayer } from "../../../hooks/useAudioPlayer";

export default function AudioInputStatic({
  label,
  children,
  required,
  fileName = "No file selected",
  audioSrc,
  id = "static-audio",
}) {
  const audioSources = useMemo(() => {
    return audioSrc ? [audioSrc] : [];
  }, [audioSrc]);

  const { playingAudio, handleAudioToggle } = useAudioPlayer(
    audioSources,
    "/uploads/audio/approved/"
  );

  const handleAudioPlay = () => {
    if (audioSrc) {
      handleAudioToggle(audioSrc);
    }
  };

  return (
    <div className={styles.label}>
      <span>
        {label} {required && <span className={styles.red}>*</span>}
      </span>
      <div className={styles.audioInputContainer}>
        <div className={styles.audioBtnContainer}>
          {playingAudio === audioSrc ? (
            <FaCircleStop
              className={styles.audioBtn}
              onClick={handleAudioPlay}
              style={{
                cursor: audioSrc ? "pointer" : "default",
                opacity: audioSrc ? 1 : 0.5,
              }}
            />
          ) : (
            <FaCirclePlay
              className={styles.audioBtn}
              onClick={handleAudioPlay}
              style={{
                cursor: audioSrc ? "pointer" : "default",
                opacity: audioSrc ? 1 : 0.5,
              }}
            />
          )}
        </div>
        <audio src={`/uploads/audio/approved/${audioSrc}`}></audio>
        <div className={styles.customAudioInput}>
          <button className={styles.button} type="button" disabled>
            Browse...
          </button>
          <span className={styles.fileName}>{fileName}</span>
          <input
            className={styles.input}
            type="file"
            accept="audio/mpeg"
            required={required || false}
            disabled
          />
        </div>
      </div>
      <small className={styles.small}>{children}</small>
    </div>
  );
}
