import styles from "./GenreTag.module.css";

export default function GenreTag({ genreTag }) {
  return (
    <span
      style={{
        color: genreTag.textColor,
        borderColor: genreTag.borderColor,
        backgroundColor: genreTag.bgColor,
      }}
      className={styles.tag}
    >
      {genreTag.name}
    </span>
  );
}
