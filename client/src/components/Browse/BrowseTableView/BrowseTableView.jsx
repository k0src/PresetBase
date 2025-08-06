import { Link } from "react-router-dom";

import GenreTag from "../../GenreTag/GenreTag";
import SynthTag from "../../SynthTag/SynthTag";
import styles from "./BrowseTableView.module.css";
import classNames from "classnames";

// import { FaFire, FaCircleExclamation } from "react-icons/fa6";

export default function BrowseTableView({
  data,
  config,
  entryType,
  filterText = "",
}) {
  const dataRowsWithIndex = data.map((item, originalIndex) => ({
    ...item,
    originalIndex,
  }));

  const filteredData = dataRowsWithIndex.filter((row) => {
    if (!filterText) return true;

    const searchText = filterText.toLowerCase();

    switch (entryType) {
      case "songs":
        return (
          row.title.toLowerCase().includes(searchText) ||
          row.artist.name.toLowerCase().includes(searchText) ||
          row.album.title.toLowerCase().includes(searchText)
        );
      case "artists":
        return (
          row.name.toLowerCase().includes(searchText) ||
          row.country.toLowerCase().includes(searchText)
        );
      case "albums":
        return (
          row.title.toLowerCase().includes(searchText) ||
          row.artist.name.toLowerCase().includes(searchText)
        );
      case "synths":
        return (
          row.name.toLowerCase().includes(searchText) ||
          row.manufacturer.toLowerCase().includes(searchText) ||
          row.type.toLowerCase().includes(searchText)
        );
      case "presets":
        return (
          row.name.toLowerCase().includes(searchText) ||
          row.synth.name.toLowerCase().includes(searchText) ||
          row.packName.toLowerCase().includes(searchText) ||
          row.author.toLowerCase().includes(searchText)
        );
      case "genres":
        return row.name.toLowerCase().includes(searchText);
      default:
        return true;
    }
  });
  const renderSongRow = (song) => (
    <Link
      key={song.id}
      to={`/song/${song.id}`}
      className={classNames(
        styles[config.gridClass],
        styles.tableRow,
        song.originalIndex % 2 === 1 ? styles.oddRow : ""
      )}
    >
      <span className={styles.rowNumber}>{song.originalIndex + 1}</span>
      <div className={styles.rowTitleContainer}>
        <div className={styles.rowImgContainer}>
          <img
            src={`/uploads/images/approved/${song.imageUrl}`}
            className={styles.rowImg}
            alt={song.title}
          />
          {/* song is new, icon */}
          {/* song is hot, icon */}
        </div>
        <div className={styles.rowTitle}>
          <span className={styles.rowTextSecondary}>{song.artist.name}</span>
          <span className={styles.rowTextPrimary}>{song.title}</span>
        </div>
      </div>
      <span className={styles.rowTextTertiary}>
        {song.album.title === "[SINGLE]" ? "Single" : song.album.title}
      </span>
      <GenreTag genre={song.genre} />
      <span className={styles.rowTextQuaternary}>{song.year}</span>
    </Link>
  );

  const renderArtistRow = (artist) => (
    <Link
      key={artist.id}
      to={`/artist/${artist.id}`}
      className={classNames(
        styles[config.gridClass],
        styles.tableRow,
        artist.originalIndex % 2 === 1 ? styles.oddRow : ""
      )}
    >
      <span className={styles.rowNumber}>{artist.originalIndex + 1}</span>
      <div className={styles.rowTitleContainer}>
        <div className={styles.rowImgContainer}>
          <img
            src={`/uploads/images/approved/${artist.imageUrl}`}
            className={styles.rowImg}
            alt={artist.name}
          />
        </div>
        <span className={styles.rowTextPrimary}>{artist.name}</span>
      </div>
      <span className={styles.rowTextSecondary}>{artist.country}</span>
    </Link>
  );

  const renderAlbumRow = (album) => (
    <Link
      key={album.id}
      to={`/album/${album.id}`}
      className={classNames(
        styles[config.gridClass],
        styles.tableRow,
        album.originalIndex % 2 === 1 ? styles.oddRow : ""
      )}
    >
      <span className={styles.rowNumber}>{album.originalIndex + 1}</span>
      <div className={styles.rowTitleContainer}>
        <div className={styles.rowImgContainer}>
          <img
            src={`/uploads/images/approved/${album.imageUrl}`}
            className={styles.rowImg}
            alt={album.title}
          />
        </div>
        <span className={styles.rowTextPrimary}>{album.title}</span>
      </div>
      <span className={styles.rowTextSecondary}>{album.artist.name}</span>
      <GenreTag genre={album.genre} />
      <span className={styles.rowTextQuaternary}>{album.year}</span>
    </Link>
  );

  const renderSynthRow = (synth) => (
    <Link
      key={synth.id}
      to={`/synth/${synth.id}`}
      className={classNames(
        styles[config.gridClass],
        styles.tableRow,
        synth.originalIndex % 2 === 1 ? styles.oddRow : ""
      )}
    >
      <span className={styles.rowNumber}>{synth.originalIndex + 1}</span>
      <div className={styles.rowTitleContainer}>
        <div className={styles.rowImgContainer}>
          <img
            src={`/uploads/images/approved/${synth.imageUrl}`}
            className={styles.rowImg}
            alt={synth.name}
          />
        </div>
        <span className={styles.rowTextPrimary}>{synth.name}</span>
      </div>
      <span className={styles.rowTextSecondary}>{synth.manufacturer}</span>
      <SynthTag type={synth.type} />
      <span className={styles.rowTextQuaternary}>{synth.year}</span>
    </Link>
  );

  const renderPresetRow = (preset) => (
    <Link
      key={preset.id}
      to={`/preset/${preset.id}`}
      className={classNames(
        styles[config.gridClass],
        styles.tableRow,
        preset.originalIndex % 2 === 1 ? styles.oddRow : ""
      )}
    >
      <span className={styles.rowNumber}>{preset.originalIndex + 1}</span>
      <div className={styles.rowTitleContainer}>
        <div className={styles.rowImgContainer}>
          <img
            src={`/uploads/images/approved/${preset.synth.imageUrl}`}
            className={styles.rowImg}
            alt={preset.synth.name}
          />
        </div>
        <span className={styles.rowTextPrimary}>{preset.name}</span>
      </div>
      <span className={styles.rowTextSecondary}>{preset.synth.name}</span>
      <span className={styles.rowTextTertiary}>{preset.packName}</span>
      <span className={styles.rowTextTertiary}>{preset.author}</span>
    </Link>
  );

  const renderGenreRow = (genre) => (
    <div
      key={genre.id}
      className={classNames(
        styles[config.gridClass],
        styles.tableRow,
        genre.originalIndex % 2 === 1 ? styles.oddRow : ""
      )}
    >
      <span className={styles.rowNumber}>{genre.originalIndex + 1}</span>
      <div className={styles.rowTitleContainer}>
        <div className={styles.rowImgContainer}>
          <img
            src={`/uploads/images/approved/${genre.imageUrl}`}
            className={styles.rowImg}
            alt={genre.name}
          />
        </div>
        <span className={styles.rowTextPrimary}>{genre.name}</span>
      </div>
      <span className={styles.rowTextSecondary}>{genre.songsCount}</span>
    </div>
  );

  const renderRow = (row) => {
    switch (entryType) {
      case "songs":
        return renderSongRow(row);
      case "artists":
        return renderArtistRow(row);
      case "albums":
        return renderAlbumRow(row);
      case "synths":
        return renderSynthRow(row);
      case "presets":
        return renderPresetRow(row);
      case "genres":
        return renderGenreRow(row);
      default:
        return null;
    }
  };

  return (
    <section>
      <div
        className={classNames(styles[config.gridClass], styles.tableColumns)}
      >
        {config.columns.map((column) => (
          <span key={column.key}>{column.label}</span>
        ))}
      </div>
      {filteredData.map((row) => renderRow(row))}
    </section>
  );
}
