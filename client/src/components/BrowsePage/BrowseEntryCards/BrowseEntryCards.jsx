import { memo } from "react";
import { Link } from "react-router-dom";
import styles from "./BrowseEntryCards.module.css";

const EntryCard = memo(function EntryCard({ entryData, entryType }) {
  const renderCardContent = () => {
    switch (entryType) {
      case "synth":
        return (
          <Link to={`/synth/${entryData.id}`} className={styles.entryCard}>
            <div className={styles.imgContainer}>
              <img
                src={`/uploads/images/approved/${entryData.imageUrl}`}
                alt={entryData.name}
                className={styles.entryCardImg}
              />
            </div>
            <div className={styles.entryCardRight}>
              <span className={styles.entryCardTextSecondary}>
                {entryData.manufacturer}
              </span>
              <span className={styles.entryCardTextPrimary}>
                {entryData.name}
              </span>
              <span className={styles.entryCardTextTertiary}>
                {entryData.presets.length} presets
              </span>
              <span className={styles.entryCardTextYear}>{entryData.year}</span>
            </div>
          </Link>
        );

      case "song":
        return (
          <Link to={`/song/${entryData.id}`} className={styles.entryCard}>
            <div className={styles.imgContainer}>
              <img
                src={`/uploads/images/approved/${entryData.imageUrl}`}
                alt={entryData.name}
                className={styles.entryCardImg}
              />
            </div>
            <div className={styles.entryCardRight}>
              <span className={styles.entryCardTextSecondary}>
                {entryData.artist.name}
              </span>
              <span className={styles.entryCardTextPrimary}>
                {entryData.title}
              </span>
              <span className={styles.entryCardTextTertiary}>
                {entryData.album.title === "[SINGLE]"
                  ? "Single"
                  : entryData.album.title}
              </span>
              <span className={styles.entryCardTextYear}>{entryData.year}</span>
            </div>
          </Link>
        );

      default:
        return null;
    }
  };

  return renderCardContent();
});

export default function BrowseEntryCards({ entriesData, entryType }) {
  return (
    <div className={styles.entryCardsContainer}>
      {entriesData.map((entry) => (
        <EntryCard key={entry.id} entryData={entry} entryType={entryType} />
      ))}
    </div>
  );
}
