import styles from "./BrowsePageHeader.module.css";

export default function BrowsePageHeader({ title }) {
  return (
    <div className={styles.header}>
      <h2 className={styles.headingSecondary}>{title}</h2>
    </div>
  );
}
