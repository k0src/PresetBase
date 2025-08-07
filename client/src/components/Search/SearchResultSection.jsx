import { memo, useMemo } from "react";
import SearchResultEntry from "./SearchResultEntry";
import styles from "./SearchResults.module.css";

export default memo(function SearchResultSection({
  title,
  data,
  type,
  filter,
}) {
  if (!data.length || (filter !== "all" && filter !== type)) {
    return null;
  }

  const gridClass = useMemo(() => {
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

  const columnHeaders = useMemo(() => {
    switch (type) {
      case "songs":
        return (
          <>
            <span>#</span>
            <span>Title</span>
            <span>Album</span>
            <span>Genre</span>
            <span>Year</span>
          </>
        );
      case "artists":
        return (
          <>
            <span>#</span>
            <span>Name</span>
            <span>Country</span>
          </>
        );
      case "albums":
        return (
          <>
            <span>#</span>
            <span>Title</span>
            <span>Artist</span>
            <span>Genre</span>
            <span>Year</span>
          </>
        );
      case "synths":
        return (
          <>
            <span>#</span>
            <span>Synth</span>
            <span>Manufacturer</span>
            <span>Synth Type</span>
            <span>Year</span>
          </>
        );
      case "presets":
        return (
          <>
            <span>#</span>
            <span>Name</span>
            <span>Synth</span>
            <span>Pack</span>
            <span>Author</span>
          </>
        );
      default:
        return null;
    }
  }, [type]);

  return (
    <div className={`${styles.searchResultsSection} --section-${type}`}>
      <h2 className={styles.headingSecondary}>{title}</h2>
      <div className={`${styles.resultColumns} ${gridClass}`}>
        {columnHeaders}
      </div>
      {data.map((entry, index) => (
        <SearchResultEntry
          key={`${type}-${entry.id}`}
          entry={entry}
          type={type}
          index={index}
        />
      ))}
    </div>
  );
});
