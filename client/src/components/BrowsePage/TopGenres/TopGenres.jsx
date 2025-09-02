import { memo } from "react";
import { FaMusic } from "react-icons/fa6";
import styles from "./TopGenres.module.css";

const GenreItem = memo(function GenreItem({ genre, index }) {
  return (
    <div key={`${genre.genre}-${index}`} className={styles.genreEntry}>
      <div className={styles.imgContainer}>
        <img
          className={styles.genreImg}
          src={`/uploads/images/approved/${genre.imageUrl}`}
          alt={genre.genre}
          loading="lazy"
        />
        <FaMusic className={styles.genreIcon} />
      </div>
      <div className={styles.titleContainer}>
        <span className={styles.genreTitle}>{genre.genre}</span>
        <span className={styles.genreCount}>{genre.songCount} songs</span>
      </div>
    </div>
  );
});

export default memo(function TopGenres({ genresData }) {
  if (!genresData || genresData.length === 0) {
    return <div className={styles.topGenresContainer}></div>;
  }

  return (
    <div className={styles.topGenresContainer}>
      {genresData.map((genre, index) => (
        <GenreItem
          key={`${genre.genre}-${index}`}
          genre={genre}
          index={index}
        />
      ))}
    </div>
  );
});
