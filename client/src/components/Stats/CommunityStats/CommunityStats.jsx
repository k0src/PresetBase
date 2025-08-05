import { useEffect, useState } from "react";
import { getCommunityStats } from "../../../api/stats";
import PageLoader from "../../PageLoader/PageLoader";
import DbError from "../../DbError/DbError";
import styles from "./CommunityStats.module.css";

export default function CommunityStats() {
  const [communityStats, setCommunityStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getCommunityStats();
        setCommunityStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <DbError errorMessage={error} />;

  return (
    <div className={styles.communityStatsText}>
      <div className={styles.communityStatsTitle}>
        Since <span className={styles.communityStatsNumber}>June 12, 2025</span>
        ,
      </div>
      <div className={styles.communityStatsTitle}>
        PresetBase has received{" "}
        <span className={styles.communityStatsNumber}>
          {communityStats.totalCount}
        </span>{" "}
        total submissions,
      </div>
      <div className={styles.communityStatsTitle}>
        with an average of{" "}
        <span className={styles.communityStatsNumber}>
          {communityStats.avgSubmissionsPerDay}
        </span>{" "}
        submissions per day.
      </div>
    </div>
  );
}
