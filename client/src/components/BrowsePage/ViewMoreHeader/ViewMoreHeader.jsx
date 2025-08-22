import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import styles from "./ViewMoreHeader.module.css";

export default memo(function ViewMoreHeader({ title, link }) {
  const isAnchor = useMemo(() => link.startsWith("#"), [link]);

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
});
