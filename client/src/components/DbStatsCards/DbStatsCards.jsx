import styles from "./DbStatsCards.module.css";

export default function DbStatsCards({ data }) {
  if (!data) return null;

  return (
    <div className={styles.dbStats}>
      <div className={styles.dbStatsCard}>
        <span className={styles.dbStatsNumber}>{data.songs}</span>
        <span className={styles.dbStatsText}>Songs</span>
      </div>
      <div className={styles.dbStatsCard}>
        <span className={styles.dbStatsNumber}>{data.artists}</span>
        <span className={styles.dbStatsText}>Artists</span>
      </div>
      <div className={styles.dbStatsCard}>
        <span className={styles.dbStatsNumber}>{data.albums}</span>
        <span className={styles.dbStatsText}>Albums</span>
      </div>
      <div className={styles.dbStatsCard}>
        <span className={styles.dbStatsNumber}>{data.synths}</span>
        <span className={styles.dbStatsText}>Synths</span>
      </div>
      <div className={styles.dbStatsCard}>
        <span className={styles.dbStatsNumber}>{data.presets}</span>
        <span className={styles.dbStatsText}>Presets</span>
      </div>
    </div>
  );
}
