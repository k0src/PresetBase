import { memo } from "react";
import { Link } from "react-router-dom";
import styles from "./BrowseAllCategories.module.css";

import {
  FaKeyboard,
  FaMasksTheater,
  FaMusic,
  FaRecordVinyl,
  FaSliders,
  FaUser,
} from "react-icons/fa6";

export default memo(function BrowseAllCategories() {
  return (
    <div id="allCategories" className={styles.categoriesContainer}>
      <Link to="/browse/songs" className={styles.categoryCard}>
        <FaMusic className={styles.categoryIcon} />
        <span className={styles.categoryText}>Songs</span>
      </Link>
      <Link to="/browse/artists" className={styles.categoryCard}>
        <FaUser className={styles.categoryIcon} />
        <span className={styles.categoryText}>Artists</span>
      </Link>
      <Link to="/browse/albums" className={styles.categoryCard}>
        <FaRecordVinyl className={styles.categoryIcon} />
        <span className={styles.categoryText}>Albums</span>
      </Link>
      <Link to="/browse/synths" className={styles.categoryCard}>
        <FaKeyboard className={styles.categoryIcon} />
        <span className={styles.categoryText}>Synths</span>
      </Link>
      <Link to="/browse/presets" className={styles.categoryCard}>
        <FaSliders className={styles.categoryIcon} />
        <span className={styles.categoryText}>Presets</span>
      </Link>
      <Link to="/browse/genres" className={styles.categoryCard}>
        <FaMasksTheater className={styles.categoryIcon} />
        <span className={styles.categoryText}>Genres</span>
      </Link>
    </div>
  );
});
