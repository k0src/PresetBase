import { FaUserPen, FaFingerprint, FaCalendar } from "react-icons/fa6";
import styles from "./SubmissionInfo.module.css";

export default function SubmissionInfo({ submission }) {
  return (
    <div className={styles.submissionHeader}>
      <div className={styles.submissionHeaderSection}>
        <FaUserPen className={styles.submissionHeaderIcon} />
        <span className={styles.submissionHeaderText}>
          Submitted by:
          <kbd className={styles.submissionHeaderKbd}>
            {submission.username}
          </kbd>
        </span>
      </div>
      <span
        className={styles.submissionHeaderDivider}
        aria-hidden="true"
      ></span>
      <div className={styles.submissionHeaderSection}>
        <FaFingerprint className={styles.submissionHeaderIcon} />
        <span className={styles.submissionHeaderText}>
          Submission ID:
          <kbd className={styles.submissionHeaderKbd}>{submission.id}</kbd>
        </span>
      </div>
      <span
        className={styles.submissionHeaderDivider}
        aria-hidden="true"
      ></span>
      <div className={styles.submissionHeaderSection}>
        <FaCalendar className={styles.submissionHeaderIcon} />
        <span className={styles.submissionHeaderText}>
          Submitted:
          <kbd className={styles.submissionHeaderKbd}>
            {submission.submittedAt}
          </kbd>
        </span>
      </div>
    </div>
  );
}
