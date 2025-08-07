import { Link } from "react-router-dom";
import { memo, useMemo } from "react";
import GenreTag from "../GenreTag/GenreTag";
import styles from "./SearchResults.module.css";

const SongEntryRow = memo(({ entry, index, getImageSrc }) => (
  <>
    <span className={styles.resultEntryNumber}>{index + 1}</span>
    <div className={styles.resultEntryTitleContainer}>
      <img
        src={getImageSrc()}
        alt={entry.title}
        className={styles.resultEntryImg}
      />
      <div className={styles.resultEntryTitle}>
        <span className={styles.resultEntrySecondary}>{entry.artist.name}</span>
        <span className={styles.resultEntryPrimary}>{entry.title}</span>
      </div>
    </div>
    <span className={styles.resultEntryTertiary}>
      {entry.album.title === "[SINGLE]" ? "Single" : entry.album.title}
    </span>
    <GenreTag genre={entry.genre} />
    <span className={styles.resultEntryQuaternary}>{entry.year}</span>
  </>
));

const ArtistEntryRow = memo(({ entry, index, getImageSrc }) => (
  <>
    <span className={styles.resultEntryNumber}>{index + 1}</span>
    <div className={styles.resultEntryTitleContainer}>
      <img
        src={getImageSrc()}
        alt={entry.name}
        className={styles.resultEntryImg}
      />
      <span className={styles.resultEntryPrimary}>{entry.name}</span>
    </div>
    <span className={styles.resultEntrySecondary}>{entry.country}</span>
  </>
));

const AlbumEntryRow = memo(({ entry, index, getImageSrc }) => (
  <>
    <span className={styles.resultEntryNumber}>{index + 1}</span>
    <div className={styles.resultEntryTitleContainer}>
      <img
        src={getImageSrc()}
        alt={entry.title}
        className={styles.resultEntryImg}
      />
      <span className={styles.resultEntryPrimary}>{entry.title}</span>
    </div>
    <span className={styles.resultEntrySecondary}>{entry.artist.name}</span>
    <GenreTag genre={entry.genre} />
    <span className={styles.resultEntryTertiary}>{entry.year}</span>
  </>
));

const SynthEntryRow = memo(({ entry, index, getImageSrc }) => (
  <>
    <span className={styles.resultEntryNumber}>{index + 1}</span>
    <div className={styles.resultEntryTitleContainer}>
      <img
        src={getImageSrc()}
        alt={entry.name}
        className={styles.resultEntryImg}
      />
      <span className={styles.resultEntryPrimary}>{entry.name}</span>
    </div>
    <span className={styles.resultEntrySecondary}>{entry.manufacturer}</span>
    <span className={styles.tag}>{entry.type}</span>
    <span className={styles.resultEntryTertiary}>{entry.year}</span>
  </>
));

const PresetEntryRow = memo(({ entry, index, getImageSrc }) => (
  <>
    <span className={styles.resultEntryNumber}>{index + 1}</span>
    <div className={styles.resultEntryTitleContainer}>
      <img
        src={getImageSrc()}
        alt={entry.name}
        className={styles.resultEntryImg}
      />
      <span className={styles.resultEntryPrimary}>{entry.name}</span>
    </div>
    <span className={styles.resultEntrySecondary}>{entry.synth.name}</span>
    <span className={styles.resultEntryTertiary}>{entry.packName}</span>
    <span className={styles.resultEntryQuaternary}>{entry.author}</span>
  </>
));

export default memo(function SearchResultEntry({ entry, type, index }) {
  const getLink = useMemo(() => {
    switch (type) {
      case "songs":
        return `/song/${entry.id}`;
      case "artists":
        return `/artist/${entry.id}`;
      case "albums":
        return `/album/${entry.id}`;
      case "synths":
        return `/synth/${entry.id}`;
      case "presets":
        return `/synth/${entry.id}`;
      default:
        return "#";
    }
  }, [type, entry.id]);

  const getImageSrc = useMemo(() => {
    const baseUrl = "/uploads/images/approved/";
    switch (type) {
      case "songs":
      case "artists":
      case "albums":
      case "synths":
        return () => baseUrl + entry.imageUrl;
      case "presets":
        return () => baseUrl + entry.synth.imageUrl;
      default:
        return () => "";
    }
  }, [type, entry.imageUrl, entry.synth?.imageUrl]);

  const getGridClass = useMemo(() => {
    switch (type) {
      case "songs":
        return styles.gridLayoutSongs;
      case "artists":
        return styles.gridLayoutArtists;
      case "albums":
        return styles.gridLayoutAlbums;
      case "synths":
        return styles.gridLayoutSynths;
      case "presets":
        return styles.gridLayoutPresets;
      default:
        return "";
    }
  }, [type]);

  const renderContent = useMemo(() => {
    const rowProps = { entry, index, getImageSrc };

    switch (type) {
      case "songs":
        return <SongEntryRow {...rowProps} />;
      case "artists":
        return <ArtistEntryRow {...rowProps} />;
      case "albums":
        return <AlbumEntryRow {...rowProps} />;
      case "synths":
        return <SynthEntryRow {...rowProps} />;
      case "presets":
        return <PresetEntryRow {...rowProps} />;
      default:
        return null;
    }
  }, [type, entry, index, getImageSrc]);

  return (
    <Link to={getLink} className={`${styles.resultEntry} ${getGridClass}`}>
      {renderContent}
    </Link>
  );
});
