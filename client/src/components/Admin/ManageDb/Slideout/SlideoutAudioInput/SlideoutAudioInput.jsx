import { useState, useRef, useEffect, memo } from "react";
import { useAudioPlayer } from "../../../../../hooks/useAudioPlayer";
import { FaCirclePlay, FaCircleStop, FaArrowUp } from "react-icons/fa6";
import classNames from "classnames";
import styles from "./SlideoutAudioInput.module.css";

const SlideoutAudioInput = memo(function SlideoutAudioInput({
  initialAudio = null,
  audioSourceId,
  id,
  onFileChange,
}) {
  const [audioFile, setAudioFile] = useState(null);
  const [hasChanged, setHasChanged] = useState(false);
  const fileInputRef = useRef(null);

  const { playingAudio, handleAudioToggle, addAudioSource, removeAudioSource } =
    useAudioPlayer();

  useEffect(() => {
    if (initialAudio && initialAudio.trim()) {
      const audioPath = `/uploads/audio/approved/${initialAudio}`;
      setAudioFile(audioPath);
      addAudioSource(audioSourceId, audioPath);
    }
  }, [initialAudio, audioSourceId, addAudioSource]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      if (audioFile) {
        removeAudioSource(audioSourceId);
        setAudioFile(null);
      }
      setHasChanged(true);
      if (onFileChange) onFileChange();
      return;
    }

    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    audio.src = objectUrl;

    audio.onerror = () => {
      alert("Invalid audio file.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      URL.revokeObjectURL(objectUrl);
    };

    audio.onloadedmetadata = () => {
      if (audio.duration > 120) {
        alert("Audio file must be 2 minutes or less.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        URL.revokeObjectURL(objectUrl);
      } else {
        if (audioFile) {
          removeAudioSource(audioSourceId);
        }
        setAudioFile(objectUrl);
        setHasChanged(true);
        addAudioSource(audioSourceId, objectUrl);
        if (onFileChange) onFileChange();
      }
    };
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAudioPlay = () => {
    if (audioFile) {
      handleAudioToggle(audioSourceId);
    }
  };

  return (
    <div className={styles.audioInputContainer}>
      {playingAudio === audioSourceId ? (
        <FaCircleStop
          className={classNames(styles.audioBtn, {
            [styles.disabled]: !audioFile,
          })}
          onClick={handleAudioPlay}
        />
      ) : (
        <FaCirclePlay
          className={classNames(styles.audioBtn, {
            [styles.disabled]: !audioFile,
          })}
          onClick={handleAudioPlay}
        />
      )}
      <FaArrowUp className={styles.uploadBtn} onClick={handleUploadClick} />
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg"
        onChange={handleFileChange}
        className={styles.input}
        required={!audioFile}
        name={hasChanged ? id : undefined}
      />
    </div>
  );
});

export default SlideoutAudioInput;
