import { FaMusic } from "react-icons/fa6";
import styles from "./TopGenres.module.css";

export default function TopGenres({ genresData }) {
  return (
    <div className={styles.topGenresContainer}>
      {genresData.length > 0 &&
        genresData.map((genre, index) => (
          <div key={`${genre}-${index}`} className={styles.genreEntry}>
            <div className={styles.imgContainer}>
              <img
                className={styles.genreImg}
                src={`/uploads/images/approved/${genre.imageUrl}`}
                alt={genre.name}
              />
              <FaMusic className={styles.genreIcon} />
            </div>
            <div className={styles.titleContainer}>
              <span className={styles.genreTitle}>{genre.name}</span>
              <span className={styles.genreCount}>{genre.songCount} songs</span>
            </div>
          </div>
        ))}
    </div>
  );
}
