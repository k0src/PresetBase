import { memo } from "react";
import { Link } from "react-router-dom";
import styles from "./EntryHeader.module.css";

const EntryHeader = memo(function EntryHeader({
  imageUrl,
  title,
  subtitle,
  subtitleLink,
  altText,
}) {
  return (
    <div className={styles.entryTitleContainer}>
      <div className={styles.entryImageContainer}>
        <img
          src={`/uploads/images/approved/${imageUrl}`}
          alt={altText || title}
          className={styles.entryImg}
        />
      </div>
      <div className={styles.entryTitleBottom}>
        {subtitleLink ? (
          <Link to={subtitleLink} className={styles.entryTitleSecondary}>
            {subtitle}
          </Link>
        ) : (
          <span className={styles.entryTitleSecondary}>{subtitle}</span>
        )}
        <span className={styles.entryTitlePrimary}>{title}</span>
      </div>
    </div>
  );
});

export default EntryHeader;
