import { Link } from "react-router-dom";
import GenreTag from "../GenreTag/GenreTag";
import styles from "./SearchResults.module.css";

export default function SearchResultEntry({ entry, type, index }) {
  const getLink = () => {
    switch (type) {
      case "songs":
        return `/song/${entry.song_id}`;
      case "artists":
        return `/artist/${entry.artist_id}`;
      case "albums":
        return `/album/${entry.album_id}`;
      case "synths":
        return `/synth/${entry.synth_id}`;
      case "presets":
        return `/synth/${entry.synth_id}`;
      default:
        return "#";
    }
  };

  const getImageSrc = () => {
    const baseUrl = "/uploads/images/approved/";
    switch (type) {
      case "songs":
        return baseUrl + entry.song_image;
      case "artists":
        return baseUrl + entry.artist_image;
      case "albums":
        return baseUrl + entry.album_image;
      case "synths":
        return baseUrl + entry.synth_image;
      case "presets":
        return baseUrl + entry.synth_image;
      default:
        return "";
    }
  };

  const getGridClass = () => {
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
  };

  const renderSongEntry = () => (
    <>
      <span className={styles.resultEntryNumber}>{index + 1}</span>
      <div className={styles.resultEntryTitleContainer}>
        <img
          src={getImageSrc()}
          alt={entry.song_title}
          className={styles.resultEntryImg}
        />
        <div className={styles.resultEntryTitle}>
          <span className={styles.resultEntrySecondary}>
            {entry.artist_name}
          </span>
          <span className={styles.resultEntryPrimary}>{entry.song_title}</span>
        </div>
      </div>
      <span className={styles.resultEntryTertiary}>
        {entry.album_title === "[SINGLE]" ? "Single" : entry.album_title}
      </span>
      <GenreTag genre={entry.song_genre} />
      <span className={styles.resultEntryQuaternary}>
        {entry.song_release_year}
      </span>
    </>
  );

  const renderArtistEntry = () => (
    <>
      <span className={styles.resultEntryNumber}>{index + 1}</span>
      <div className={styles.resultEntryTitleContainer}>
        <img
          src={getImageSrc()}
          alt={entry.artist_name}
          className={styles.resultEntryImg}
        />
        <span className={styles.resultEntryPrimary}>{entry.artist_name}</span>
      </div>
      <span className={styles.resultEntrySecondary}>
        {entry.artist_country}
      </span>
    </>
  );

  const renderAlbumEntry = () => (
    <>
      <span className={styles.resultEntryNumber}>{index + 1}</span>
      <div className={styles.resultEntryTitleContainer}>
        <img
          src={getImageSrc()}
          alt={entry.album_title}
          className={styles.resultEntryImg}
        />
        <span className={styles.resultEntryPrimary}>{entry.album_title}</span>
      </div>
      <span className={styles.resultEntrySecondary}>{entry.artist_name}</span>
      <GenreTag genre={entry.album_genre} />
      <span className={styles.resultEntryTertiary}>
        {entry.album_release_year}
      </span>
    </>
  );

  const renderSynthEntry = () => (
    <>
      <span className={styles.resultEntryNumber}>{index + 1}</span>
      <div className={styles.resultEntryTitleContainer}>
        <img
          src={getImageSrc()}
          alt={entry.synth_name}
          className={styles.resultEntryImg}
        />
        <span className={styles.resultEntryPrimary}>{entry.synth_name}</span>
      </div>
      <span className={styles.resultEntrySecondary}>
        {entry.synth_manufacturer}
      </span>
      <span className={styles.tag}>{entry.synth_type}</span>
      <span className={styles.resultEntryTertiary}>
        {entry.synth_release_year}
      </span>
    </>
  );

  const renderPresetEntry = () => (
    <>
      <span className={styles.resultEntryNumber}>{index + 1}</span>
      <div className={styles.resultEntryTitleContainer}>
        <img
          src={getImageSrc()}
          alt={entry.preset_name}
          className={styles.resultEntryImg}
        />
        <span className={styles.resultEntryPrimary}>{entry.preset_name}</span>
      </div>
      <span className={styles.resultEntrySecondary}>{entry.synth_name}</span>
      <span className={styles.resultEntryTertiary}>
        {entry.preset_pack_name}
      </span>
      <span className={styles.resultEntryQuaternary}>
        {entry.preset_author}
      </span>
    </>
  );

  const renderContent = () => {
    switch (type) {
      case "songs":
        return renderSongEntry();
      case "artists":
        return renderArtistEntry();
      case "albums":
        return renderAlbumEntry();
      case "synths":
        return renderSynthEntry();
      case "presets":
        return renderPresetEntry();
      default:
        return null;
    }
  };

  return (
    <Link to={getLink()} className={`${styles.resultEntry} ${getGridClass()}`}>
      {renderContent()}
    </Link>
  );
}
