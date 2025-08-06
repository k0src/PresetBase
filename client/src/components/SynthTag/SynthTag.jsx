import styles from "./SynthTag.module.css";

export default function SynthTag({ type }) {
  return <span className={styles.tag}>{type}</span>;
}
