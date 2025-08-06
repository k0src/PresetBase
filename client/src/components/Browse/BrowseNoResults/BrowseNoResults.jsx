import styles from "./BrowseNoResults.module.css";
import { FaBan } from "react-icons/fa6";

export default function BrowseNoResults({ entryType }) {
  return (
    <div className={styles.noResultsContainer}>
      <FaBan className={styles.noResultsIcon} />
      <span className={styles.noResultsText}>No {entryType} found.</span>
    </div>
  );
}
