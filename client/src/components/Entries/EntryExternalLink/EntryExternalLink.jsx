import { memo } from "react";

import styles from "./EntryExternalLink.module.css";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

const EntryExternalLink = memo(function EntryExternalLink({
  url,
  linkLabel = "Open song in new tab",
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.entryOpenLink}
    >
      <span className={styles.entryOpenLinkText}>{linkLabel}</span>
      <FaArrowUpRightFromSquare className={styles.entryOpenLinkIcon} />
    </a>
  );
});

export default EntryExternalLink;
