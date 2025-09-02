import styles from "./GenreTag.module.css";

export default function GenreTag({ children }) {
  return <span className={styles.tag}>{children}</span>;
}
