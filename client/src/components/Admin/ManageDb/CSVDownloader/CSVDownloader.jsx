import { useCSVDownloader } from "../../../../hooks/useCSVDownloader";
import styles from "./CSVDownloader.module.css";

import { FaDownload, FaCircleNotch, FaXmark } from "react-icons/fa6";

export default function CSVDownloader({ entryType }) {
  const { loading, error, download } = useCSVDownloader(entryType);

  if (loading) {
    return <FaCircleNotch className={styles.loadingIcon} />;
  }

  if (error) {
    return <FaXmark className={styles.errorIcon} onClick={download} />;
  }

  return <FaDownload className={styles.downloadIcon} onClick={download} />;
}
