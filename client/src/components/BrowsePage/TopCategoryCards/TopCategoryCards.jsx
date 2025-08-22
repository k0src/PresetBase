import { Link } from "react-router-dom";
import styles from "./TopCategoryCards.module.css";

import { FaKeyboard, FaMusic, FaSliders, FaUser } from "react-icons/fa6";

export default function TopCategoryCards() {
  return (
    <div className={styles.topCategoryCards}>
      <Link to="/browse/songs" className={styles.topCategoryCard}>
        <FaMusic className={styles.topCategoryIcon} />
        <span className={styles.topCategoryText}>Songs</span>
      </Link>
      <Link to="/browse/artists" className={styles.topCategoryCard}>
        <FaUser className={styles.topCategoryIcon} />
        <span className={styles.topCategoryText}>Artists</span>
      </Link>
      <Link to="/browse/synths" className={styles.topCategoryCard}>
        <FaKeyboard className={styles.topCategoryIcon} />
        <span className={styles.topCategoryText}>Synths</span>
      </Link>
      <Link to="/browse/presets" className={styles.topCategoryCard}>
        <FaSliders className={styles.topCategoryIcon} />
        <span className={styles.topCategoryText}>Presets</span>
      </Link>
    </div>
  );
}
