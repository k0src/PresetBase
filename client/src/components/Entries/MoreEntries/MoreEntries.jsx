import { memo, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import styles from "./MoreEntries.module.css";

const MoreEntries = memo(function MoreEntries({
  title,
  entries,
  entryType,
  linkPrefix,
}) {
  if (!entries || entries.length === 0) {
    return null;
  }

  const getEntryData = useCallback(
    (entry) => {
      switch (entryType) {
        case "songs":
          return {
            id: entry.id,
            title: entry.title,
            imageUrl: entry.imageUrl,
            className: styles.moreSongsEntry,
            imgClassName: styles.moreSongsImg,
            titleClassName: styles.moreSongsTitle,
          };
        case "albums":
          return {
            id: entry.id,
            title: entry.title,
            imageUrl: entry.imageUrl,
            className: styles.moreAlbumsEntry,
            imgClassName: styles.moreAlbumsImg,
            titleClassName: styles.moreAlbumsTitle,
          };
        case "synths":
          return {
            id: entry.id,
            title: entry.name,
            imageUrl: entry.imageUrl,
            className: styles.moreSynthsEntry,
            imgClassName: styles.moreSynthsImg,
            titleClassName: styles.moreSynthsTitle,
          };
        default:
          return {
            id: entry.id,
            title: entry.title,
            imageUrl: entry.imageUrl,
            className: styles.moreEntriesLink,
            imgClassName: styles.moreEntriesImg,
            titleClassName: styles.moreEntriesTitle,
          };
      }
    },
    [entryType]
  );

  const renderedEntries = useMemo(() => {
    return entries.map((entry) => {
      const entryData = getEntryData(entry);
      return (
        <Link
          key={entryData.id}
          to={`/${linkPrefix}/${entryData.id}`}
          className={entryData.className}
        >
          <img
            src={`/uploads/images/approved/${entryData.imageUrl}`}
            alt={entryData.title}
            className={entryData.imgClassName}
          />
          <span className={entryData.titleClassName}>{entryData.title}</span>
        </Link>
      );
    });
  }, [entries, getEntryData, linkPrefix]);

  return (
    <div className={styles.moreEntriesContainer}>
      <div className={styles.moreEntriesHeader}>
        <span className={styles.moreEntriesHeaderTitle}>{title}</span>
      </div>
      <div className={styles.moreEntriesSection}>{renderedEntries}</div>
    </div>
  );
});

export default MoreEntries;
