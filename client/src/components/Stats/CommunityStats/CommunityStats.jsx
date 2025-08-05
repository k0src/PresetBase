import styles from "./CommunityStats.module.css";

export default function CommunityStats({ data }) {
  if (!data) return null;

  return (
    <div className={styles.communityStatsText}>
      <div className={styles.communityStatsTitle}>
        Since <span className={styles.communityStatsNumber}>June 12, 2025</span>
        ,
      </div>
      <div className={styles.communityStatsTitle}>
        PresetBase has received{" "}
        <span className={styles.communityStatsNumber}>{data.totalCount}</span>{" "}
        total submissions,
      </div>
      <div className={styles.communityStatsTitle}>
        with an average of{" "}
        <span className={styles.communityStatsNumber}>
          {data.avgSubmissionsPerDay}
        </span>{" "}
        submissions per day.
      </div>
    </div>
  );
}
