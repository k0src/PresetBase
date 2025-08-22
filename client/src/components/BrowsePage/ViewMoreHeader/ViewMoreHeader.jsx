import { Link } from "react-router-dom";
import styles from "./ViewMoreHeader.module.css";

export default function ViewMoreHeader({ title, link }) {
  const isAnchor = link.startsWith("#");

  return (
    <div className={styles.header}>
      <h2 className={styles.headingSecondary}>{title}</h2>
      {isAnchor ? (
        <a href={link} className={styles.viewMoreLink}>
          View more
        </a>
      ) : (
        <Link to={link} className={styles.viewMoreLink}>
          View more
        </Link>
      )}
    </div>
  );
}
