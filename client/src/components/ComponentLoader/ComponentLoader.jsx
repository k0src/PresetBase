import styles from "./ComponentLoader.module.css";
import { BounceLoader } from "react-spinners";

export default function ComponentLoader() {
  return (
    <div className={styles.loaderContainer}>
      <BounceLoader color="#e3e5e4" size={60} />
    </div>
  );
}
