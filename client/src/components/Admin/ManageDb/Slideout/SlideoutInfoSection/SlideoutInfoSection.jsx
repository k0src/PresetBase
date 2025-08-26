import { memo, useMemo } from "react";
import { Link } from "react-router-dom";

import styles from "./SlideoutInfoSection.module.css";

import { FaArrowUpRightFromSquare } from "react-icons/fa6";

const SlideoutInfoSection = memo(function SlideoutInfoSection({
  entryType,
  data,
}) {
  const SongInfoSection = memo(({ song }) => (
    <>
      <div className={styles.infoEntry}>
        <span className={styles.infoText}>
          <strong>Song ID:</strong>
        </span>
        <span className={styles.infoText}>{song.id}</span>
      </div>

      <div className={styles.infoEntry}>
        <span className={styles.infoText}>&bull;</span>
      </div>

      <div className={styles.infoEntry}>
        <span className={styles.infoText}>
          <strong>Date Added:</strong>
        </span>
        <span className={styles.infoText}>{song.timestamp}</span>
      </div>

      <div className={styles.infoEntry}>
        <span className={styles.infoText}>&bull;</span>
      </div>

      <Link className={styles.infoLink} to={`/song/${song.id}`}>
        <span className={styles.infoText}>View song page</span>
        <FaArrowUpRightFromSquare className={styles.infoLinkIcon} />
      </Link>
    </>
  ));

  const ArtistInfoSection = memo(({ artist }) => (
    <>
      <div className={styles.infoEntry}>
        <span className={styles.infoText}>
          <strong>Artist ID:</strong>
        </span>
        <span className={styles.infoText}>{artist.id}</span>
      </div>

      <div className={styles.infoEntry}>
        <span className={styles.infoText}>&bull;</span>
      </div>

      <div className={styles.infoEntry}>
        <span className={styles.infoText}>
          <strong>Date Added:</strong>
        </span>
        <span className={styles.infoText}>{artist.timestamp}</span>
      </div>

      <div className={styles.infoEntry}>
        <span className={styles.infoText}>&bull;</span>
      </div>

      <Link className={styles.infoLink} to={`/artist/${artist.id}`}>
        <span className={styles.infoText}>View artist page</span>
        <FaArrowUpRightFromSquare className={styles.infoLinkIcon} />
      </Link>
    </>
  ));

  const AlbumInfoSection = memo(({ album }) => (
    <>
      <div className={styles.infoEntry}>
        <span className={styles.infoText}>
          <strong>Album ID:</strong>
        </span>
        <span className={styles.infoText}>{album.id}</span>
      </div>

      <div className={styles.infoEntry}>
        <span className={styles.infoText}>&bull;</span>
      </div>

      <div className={styles.infoEntry}>
        <span className={styles.infoText}>
          <strong>Date Added:</strong>
        </span>
        <span className={styles.infoText}>{album.timestamp}</span>
      </div>

      <div className={styles.infoEntry}>
        <span className={styles.infoText}>&bull;</span>
      </div>

      <Link className={styles.infoLink} to={`/album/${album.id}`}>
        <span className={styles.infoText}>View album page</span>
        <FaArrowUpRightFromSquare className={styles.infoLinkIcon} />
      </Link>
    </>
  ));

  const PresetInfoSection = memo(({ preset }) => (
    <>
      <div className={styles.infoEntry}>
        <span className={styles.infoText}>
          <strong>Preset ID:</strong>
        </span>
        <span className={styles.infoText}>{preset.id}</span>
      </div>

      <div className={styles.infoEntry}>
        <span className={styles.infoText}>&bull;</span>
      </div>

      <div className={styles.infoEntry}>
        <span className={styles.infoText}>
          <strong>Date Added:</strong>
        </span>
        <span className={styles.infoText}>{preset.timestamp}</span>
      </div>
    </>
  ));

  const SynthInfoSection = memo(({ synth }) => (
    <>
      <div className={styles.infoEntry}>
        <span className={styles.infoText}>
          <strong>Synth ID:</strong>
        </span>
        <span className={styles.infoText}>{synth.id}</span>
      </div>

      <div className={styles.infoEntry}>
        <span className={styles.infoText}>&bull;</span>
      </div>

      <div className={styles.infoEntry}>
        <span className={styles.infoText}>
          <strong>Date Added:</strong>
        </span>
        <span className={styles.infoText}>{synth.timestamp}</span>
      </div>

      <div className={styles.infoEntry}>
        <span className={styles.infoText}>&bull;</span>
      </div>

      <Link className={styles.infoLink} to={`/synth/${synth.id}`}>
        <span className={styles.infoText}>View synth page</span>
        <FaArrowUpRightFromSquare className={styles.infoLinkIcon} />
      </Link>
    </>
  ));

  const GenreInfoSection = memo(({ genre }) => (
    <>
      <div className={styles.infoEntry}>
        <span className={styles.infoText}>
          <strong>Genre ID:</strong>
        </span>
        <span className={styles.infoText}>{genre.id}</span>
      </div>

      <div className={styles.infoEntry}>
        <span className={styles.infoText}>&bull;</span>
      </div>

      <div className={styles.infoEntry}>
        <span className={styles.infoText}>
          <strong>Date Added:</strong>
        </span>
        <span className={styles.infoText}>{genre.timestamp}</span>
      </div>
    </>
  ));

  const renderSongInfoSection = (song) => <SongInfoSection song={song} />;
  const renderArtistInfoSection = (artist) => (
    <ArtistInfoSection artist={artist} />
  );
  const renderAlbumInfoSection = (album) => <AlbumInfoSection album={album} />;
  const renderPresetInfoSection = (preset) => (
    <PresetInfoSection preset={preset} />
  );
  const renderSynthInfoSection = (synth) => <SynthInfoSection synth={synth} />;
  const renderGenreInfoSection = (genre) => <GenreInfoSection genre={genre} />;

  const renderInfoSection = useMemo(() => {
    switch (entryType) {
      case "songs":
        return renderSongInfoSection;
      case "artists":
        return renderArtistInfoSection;
      case "albums":
        return renderAlbumInfoSection;
      case "presets":
        return renderPresetInfoSection;
      case "synths":
        return renderSynthInfoSection;
      case "genres":
        return renderGenreInfoSection;
      default:
        return () => null;
    }
  }, [entryType]);

  return (
    <div className={styles.entryInfoTop}>{data && renderInfoSection(data)}</div>
  );
});

export default SlideoutInfoSection;
