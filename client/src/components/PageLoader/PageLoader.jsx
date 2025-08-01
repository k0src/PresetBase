import styles from "./PageLoader.module.css";
import { BounceLoader } from "react-spinners";

export default function PageLoader() {
  return (
    <div className={styles.loaderContainer}>
      <BounceLoader color="#e3e5e4" size={60} />
    </div>
  );
}
