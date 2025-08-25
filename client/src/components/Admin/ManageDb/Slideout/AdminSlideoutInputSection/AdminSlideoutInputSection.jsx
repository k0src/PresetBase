import { memo, useMemo } from "react";

import AdminSlideoutInput from "../AdminSlideoutInput/AdminSlideoutInput";
import styles from "./AdminSlideoutInputSection.module.css";

const AdminSlideoutInputSection = memo(function AdminSlideoutInputSection({
  entryType,
  inputData,
}) {
  const SongInputSection = memo(({ song }) => {
    <>
      <AdminSlideoutInput
        required
        type="text"
        id="songTitle"
        label="Title"
        defaultValue={song.title || ""}
      />

      <AdminSlideoutInput
        required
        type="text"
        id="songGenre"
        label="Genre"
        defaultValue={song.genre || ""}
      />

      <AdminSlideoutInput
        required
        type="text"
        id="songYear"
        label="Release Year"
        defaultValue={song.year || ""}
      />

      <AdminSlideoutInput
        required
        type="url"
        id="songUrl"
        label="Song URL"
        defaultValue={song.songUrl || ""}
      />
    </>;
  });

  const ArtistInputSection = memo(({ artist }) => {
    <>
      <AdminSlideoutInput
        required
        type="text"
        id="artistName"
        label="Name"
        defaultValue={artist.name || ""}
      />

      <AdminSlideoutInput
        required
        type="text"
        id="artistCountry"
        label="Country"
        defaultValue={artist.country || ""}
      />
    </>;
  });

  const AlbumInputSection = memo(({ album }) => {
    <>
      <AdminSlideoutInput
        required
        type="text"
        id="albumTitle"
        label="Title"
        defaultValue={album.title || ""}
      />

      <AdminSlideoutInput
        required
        type="text"
        id="albumGenre"
        label="Genre"
        defaultValue={artist.country || ""}
      />

      <AdminSlideoutInput
        required
        type="text"
        id="albumYear"
        label="Release Year"
        defaultValue={artist.year || ""}
      />
    </>;
  });

  const PresetInputSection = memo(({ preset }) => {
    <>
      <AdminSlideoutInput
        required
        type="text"
        id="presetName"
        label="Name"
        defaultValue={preset.name || ""}
      />

      <AdminSlideoutInput
        required
        type="text"
        id="presetPackName"
        label="Pack Name"
        defaultValue={preset.packName || ""}
      />

      <AdminSlideoutInput
        required
        type="text"
        id="presetAuthor"
        label="Author"
        defaultValue={preset.author || ""}
      />
    </>;
  });

  const SynthInputSection = memo(({ preset }) => {
    <>
      <AdminSlideoutInput
        required
        type="text"
        id="synthName"
        label="Name"
        defaultValue={synth.name || ""}
      />

      <AdminSlideoutInput
        required
        type="text"
        id="synthManufacturer"
        label="Manufacturer"
        defaultValue={synth.manufacturer || ""}
      />

      <AdminSlideoutInput
        required
        type="text"
        id="synthType"
        label="Synth Type"
        defaultValue={synth.type || ""}
      />

      <AdminSlideoutInput
        required
        type="text"
        id="synthYear"
        label="Release Year"
        defaultValue={synth.year || ""}
      />
    </>;
  });

  const GenreInputSection = memo(({ preset }) => {
    <>
      <AdminSlideoutInput
        required
        type="text"
        id="genreName"
        label="Name"
        defaultValue={genre.name || ""}
      />

      <AdminSlideoutInput
        required
        type="text"
        id="genreSlug"
        label="Slug"
        defaultValue={genre.slug || ""}
      />
    </>;
  });

  const renderSongInputSection = (song) => <SongInputSection song={song} />;
  const renderArtistInputSection = (artist) => (
    <ArtistInputSection artist={artist} />
  );
  const renderAlbumInputSection = (album) => (
    <AlbumInputSection album={album} />
  );
  const renderPresetInputSection = (preset) => (
    <PresetInputSection preset={preset} />
  );
  const renderSynthInputSection = (synth) => (
    <SynthInputSection synth={synth} />
  );
  const renderGenreInputSection = (genre) => (
    <GenreInputSection genre={genre} />
  );

  const renderInputSection = useMemo(() => {
    switch (entryType) {
      case "songs":
        return renderSongInputSection;
      case "artists":
        return renderArtistInputSection;
      case "albums":
        return renderAlbumInputSection;
      case "presets":
        return renderPresetInputSection;
      case "synths":
        return renderSynthInputSection;
      case "genres":
        return renderGenreInputSection;
      default:
        return () => null;
    }
  }, [entryType]);

  return (
    <div className={styles.entryInputs}>
      {inputData && renderInputSection(inputData)}
    </div>
  );
});

export default AdminSlideoutInputSection;
