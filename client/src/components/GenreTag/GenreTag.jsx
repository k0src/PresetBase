import styles from "./GenreTag.module.css";

export default function GenreTag({ genre }) {
  return <span className={styles.tag}>{genre}</span>;
}
