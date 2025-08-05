import { getTotalEntries } from "../../../api/api";

import { useState, useEffect } from "react";

import DbError from "../../DbError/DbError";
import PageLoader from "../../PageLoader/PageLoader";
import styles from "./DbStatsCards.module.css";

export default function DbStatsCards() {
  const [totalEntries, setTotalEntries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTotalEntries = async () => {
      try {
        setLoading(true);
        const data = await getTotalEntries();
        setTotalEntries(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTotalEntries();
  }, []);

  if (loading) return <PageLoader />;

  if (error || totalEntries === null) {
    return <DbError errorMessage={error} />;
  }

  return (
    <div className={styles.dbStats}>
      <div className={styles.dbStatsCard}>
        <span className={styles.dbStatsNumber}>{totalEntries.songs}</span>
        <span className={styles.dbStatsText}>Songs</span>
      </div>
      <div className={styles.dbStatsCard}>
        <span className={styles.dbStatsNumber}>{totalEntries.artists}</span>
        <span className={styles.dbStatsText}>Artists</span>
      </div>
      <div className={styles.dbStatsCard}>
        <span className={styles.dbStatsNumber}>{totalEntries.albums}</span>
        <span className={styles.dbStatsText}>Album</span>
      </div>
      <div className={styles.dbStatsCard}>
        <span className={styles.dbStatsNumber}>{totalEntries.synths}</span>
        <span className={styles.dbStatsText}>Synths</span>
      </div>
      <div className={styles.dbStatsCard}>
        <span className={styles.dbStatsNumber}>{totalEntries.presets}</span>
        <span className={styles.dbStatsText}>Presets</span>
      </div>
    </div>
  );
}
