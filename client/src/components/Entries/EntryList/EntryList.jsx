import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import styles from "./EntryList.module.css";

import { FaCirclePlay, FaCircleStop } from "react-icons/fa6";

function useEntryConfig(entryType) {
  return useMemo(() => {
    const configs = {
      presets: {
        headers: ["#", "Preset", "Synth", "Usage Type", "Preview"],
        gridClass: "gridLayoutPresets",
        hasAudio: true,
      },
      "presets-synth": {
        headers: ["#", "Name", "Pack", "Author"],
        gridClass: "gridLayoutPresetsSynth",
        hasAudio: false,
      },
      songs: {
        headers: ["#", "Title", "Album", "Genre", "Year"],
        gridClass: "gridLayoutSongs",
        hasAudio: false,
      },
    };

    return configs[entryType] || null;
  }, [entryType]);
}

function useEntryFilter(entries, entryType) {
  const [filterValue, setFilterValue] = useState("");

  const filteredEntries = useMemo(() => {
    if (!filterValue.trim()) return entries;

    const query = filterValue.toLowerCase();

    const searchFields = {
      presets: (entry) => [entry.name, entry.synth.name],
      "presets-synth": (entry) => [entry.name, entry.packName],
      songs: (entry) => [entry.title, entry.album.title],
    };

    const getFields = searchFields[entryType];
    if (!getFields) return entries;

    return entries.filter((entry) => {
      const fields = getFields(entry);
      return fields.some(
        (field) => field && field.toLowerCase().includes(query)
      );
    });
  }, [entries, filterValue, entryType]);

  return {
    filterValue,
    setFilterValue,
    filteredEntries,
  };
}

function useAudioPlayer(entries, hasAudio) {
  const [playingAudio, setPlayingAudio] = useState(null);
  const audioRefs = useRef({});

  useEffect(() => {
    if (!hasAudio) return;

    entries.forEach((entry) => {
      if (entry.audioUrl && !audioRefs.current[entry.audioUrl]) {
        const audio = new Audio(`/uploads/audio/approved/${entry.audioUrl}`);
        audioRefs.current[entry.audioUrl] = audio;
      }
    });
  }, [entries, hasAudio]);

  // Stop and cleanup all audio when component unmounts
  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      setPlayingAudio(null);
    };
  }, []);

  const handleAudioToggle = async (audioUrl) => {
    // Stop all other audio
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    const audioElement = audioRefs.current[audioUrl];

    if (playingAudio === audioUrl) {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      setPlayingAudio(null);
    } else {
      if (audioElement) {
        try {
          await audioElement.play();
          setPlayingAudio(audioUrl);

          audioElement.onended = () => {
            setPlayingAudio(null);
          };
        } catch (error) {
          console.error("Audio play failed:", error);
        }
      }
    }
  };

  return {
    playingAudio,
    handleAudioToggle,
  };
}

function FilterInput({ filterValue, onFilterChange, placeholder }) {
  const handleClear = () => {
    onFilterChange("");
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filter}>
        <input
          type="text"
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder={placeholder}
          className={styles.filterInput}
        />
        <i
          className={`fa-solid fa-xmark ${styles.filterClearIcon}`}
          onClick={handleClear}
        ></i>
      </div>
    </div>
  );
}

function AudioPlayer({ audioUrl, isPlaying, onToggle }) {
  const handleClick = () => onToggle();

  return (
    <div className={styles.rowPresetAudioContainer}>
      {isPlaying ? (
        <FaCircleStop
          onClick={handleClick}
          className={styles.rowPresetPlayBtn}
          style={{ cursor: "pointer" }}
        />
      ) : (
        <FaCirclePlay
          onClick={handleClick}
          className={styles.rowPresetPlayBtn}
          style={{ cursor: "pointer" }}
        />
      )}
      <audio
        src={`/uploads/audio/approved/${audioUrl}`}
        className={styles.rowPresetAudio}
      ></audio>
    </div>
  );
}

function EntryRow({
  entry,
  index,
  entryType,
  config,
  playingAudio,
  onAudioToggle,
}) {
  const renderRowContent = () => {
    switch (entryType) {
      case "presets":
        return (
          <>
            <span className={styles.rowNumber}>{index + 1}</span>
            <div className={styles.rowTitleContainer}>
              <img
                src={`/uploads/images/approved/${entry.synth.imageUrl}`}
                alt={entry.name}
                className={styles.rowImg}
              />
              <span className={styles.rowTextPrimary}>{entry.name}</span>
            </div>
            <Link
              to={`/synth/${entry.synth.id}`}
              className={styles.rowTextSecondary}
            >
              {entry.synth.name}
            </Link>
            <span className={styles.rowTextTertiary}>{entry.usageType}</span>
            <AudioPlayer
              audioUrl={entry.audioUrl}
              isPlaying={playingAudio === entry.audioUrl}
              onToggle={() => onAudioToggle(entry.audioUrl)}
            />
          </>
        );

      case "presets-synth":
        return (
          <>
            <span className={styles.rowNumber}>{index + 1}</span>
            <div className={styles.rowTitleContainer}>
              <img
                src={`/uploads/images/approved/${entry.imageUrl}`}
                alt={entry.name}
                className={styles.rowImg}
              />
              <span className={styles.rowTextPrimary}>{entry.name}</span>
            </div>
            <span className={styles.rowTextTertiary}>{entry.packName}</span>
            <span className={styles.rowTextTertiary}>{entry.author}</span>
          </>
        );

      case "songs":
        return (
          <>
            <span className={styles.rowNumber}>{index + 1}</span>
            <div className={styles.rowTitleContainer}>
              <img
                src={`/uploads/images/approved/${entry.imageUrl}`}
                alt={entry.title}
                className={styles.rowImg}
              />
              <span className={styles.rowTextPrimary}>{entry.title}</span>
            </div>
            <span className={styles.rowTextTertiary}>
              {entry.album_title === "[SINGLE]" ? "Single" : entry.album}
            </span>
            <span className={styles.tag}>{entry.genre}</span>
            <span className={styles.rowTextQuaternary}>{entry.year}</span>
          </>
        );

      default:
        return null;
    }
  };

  const RowWrapper = entryType === "songs" ? Link : "div";
  const rowProps = entryType === "songs" ? { to: `/song/${entry.id}` } : {};

  return (
    <RowWrapper
      {...rowProps}
      className={`${styles[config.gridClass]} ${styles.entryTableRow}`}
    >
      {renderRowContent()}
    </RowWrapper>
  );
}

export default function EntryList({
  title,
  entries,
  entryType,
  filterPlaceholder = "Filter entries",
}) {
  const config = useEntryConfig(entryType);
  const { filterValue, setFilterValue, filteredEntries } = useEntryFilter(
    entries,
    entryType
  );
  const { playingAudio, handleAudioToggle } = useAudioPlayer(
    entries,
    config?.hasAudio || false
  );

  if (!config) {
    console.error(`Unknown entry type: ${entryType}`);
    return null;
  }

  return (
    <div className={styles.entryRight}>
      <h2 className={styles.entryTitleSecondary}>{title}</h2>

      <FilterInput
        filterValue={filterValue}
        onFilterChange={setFilterValue}
        placeholder={filterPlaceholder}
      />

      <div className={styles.entryTable}>
        <div className={`${styles.entryTableCols} ${styles[config.gridClass]}`}>
          {config.headers.map((header, index) => (
            <span
              key={index}
              className={
                styles[`headerLabel${header.replace(/\s+/g, "")}`] || ""
              }
            >
              {header}
            </span>
          ))}
        </div>

        {filteredEntries.map((entry, index) => (
          <EntryRow
            key={entry.id || index}
            entry={entry}
            index={index}
            entryType={entryType}
            config={config}
            playingAudio={playingAudio}
            onAudioToggle={handleAudioToggle}
          />
        ))}
      </div>
    </div>
  );
}
