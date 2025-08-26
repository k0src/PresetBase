import { memo, useMemo } from "react";

import SlideoutInput from "../SlideoutInput/SlideoutInput";
import SlideoutGenreColorPicker from "../SlideoutGenreColorPicker/SlideoutGenreColorPicker";
import SlideoutImageInput from "../SlideoutImageInput/SlideoutImageInput";
import styles from "./SlideoutInputSection.module.css";

const SlideoutInputSection = memo(function SlideoutInputSection({
  entryType,
  data,
}) {
  const SongInputSection = memo(({ song }) => {
    <>
      <SlideoutInput
        required
        type="text"
        id="songTitle"
        label="Title"
        defaultValue={song.title || ""}
      />

      <SlideoutInput
        required
        type="text"
        id="songGenre"
        label="Genre"
        defaultValue={song.genre || ""}
      />

      <SlideoutInput
        required
        type="text"
        id="songYear"
        label="Release Year"
        defaultValue={song.year || ""}
      />

      <SlideoutInput
        required
        type="url"
        id="songUrl"
        label="Song URL"
        defaultValue={song.songUrl || ""}
      />

      <SlideoutImageInput
        required
        initialImage={song.imageUrl || null}
        label="Cover Image"
        id="songImageUrl"
      />
    </>;
  });

  const ArtistInputSection = memo(({ artist }) => {
    <>
      <SlideoutInput
        required
        type="text"
        id="artistName"
        label="Name"
        defaultValue={artist.name || ""}
      />

      <SlideoutInput
        required
        type="text"
        id="artistCountry"
        label="Country"
        defaultValue={artist.country || ""}
      />

      <SlideoutImageInput
        required
        initialImage={artist.imageUrl || null}
        label="Artist Image"
        id="artistImageUrl"
      />
    </>;
  });

  const AlbumInputSection = memo(({ album }) => {
    <>
      <SlideoutInput
        required
        type="text"
        id="albumTitle"
        label="Title"
        defaultValue={album.title || ""}
      />

      <SlideoutInput
        required
        type="text"
        id="albumGenre"
        label="Genre"
        defaultValue={artist.country || ""}
      />

      <SlideoutInput
        required
        type="text"
        id="albumYear"
        label="Release Year"
        defaultValue={artist.year || ""}
      />

      <SlideoutImageInput
        required
        initialImage={album.imageUrl || null}
        label="Cover Image"
        id="albumImageUrl"
      />
    </>;
  });

  const PresetInputSection = memo(({ preset }) => {
    <>
      <SlideoutInput
        required
        type="text"
        id="presetName"
        label="Name"
        defaultValue={preset.name || ""}
      />

      <SlideoutInput
        required
        type="text"
        id="presetPackName"
        label="Pack Name"
        defaultValue={preset.packName || ""}
      />

      <SlideoutInput
        required
        type="text"
        id="presetAuthor"
        label="Author"
        defaultValue={preset.author || ""}
      />
    </>;
  });

  const SynthInputSection = memo(({ synth }) => {
    <>
      <SlideoutInput
        required
        type="text"
        id="synthName"
        label="Name"
        defaultValue={synth.name || ""}
      />

      <SlideoutInput
        required
        type="text"
        id="synthManufacturer"
        label="Manufacturer"
        defaultValue={synth.manufacturer || ""}
      />

      <SlideoutInput
        required
        type="text"
        id="synthType"
        label="Synth Type"
        defaultValue={synth.type || ""}
      />

      <SlideoutInput
        required
        type="text"
        id="synthYear"
        label="Release Year"
        defaultValue={synth.year || ""}
      />

      <SlideoutImageInput
        required
        initialImage={synth.imageUrl || null}
        label="Synth Image"
        id="synthImageUrl"
      />
    </>;
  });

  const GenreInputSection = memo(({ genre }) => {
    <>
      <SlideoutInput
        required
        type="text"
        id="genreName"
        label="Name"
        defaultValue={genre.name || ""}
      />

      <SlideoutInput
        required
        type="text"
        id="genreSlug"
        label="Slug"
        defaultValue={genre.slug || ""}
      />

      <div className={styles.colorPickers}>
        <SlideoutGenreColorPicker
          defaultValue={genre.textColor || "#ffffff"}
          label="Text Color"
        />

        <SlideoutGenreColorPicker
          defaultValue={genre.backgroundColor || "#ffffff"}
          label="Background Color"
        />

        <SlideoutGenreColorPicker
          defaultValue={genre.borderColor || "#ffffff"}
          label="Border Color"
        />
      </div>
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
    <div className={styles.inputSection}>
      {data && renderInputSection(data)}
    </div>
  );
});

export default SlideoutInputSection;
