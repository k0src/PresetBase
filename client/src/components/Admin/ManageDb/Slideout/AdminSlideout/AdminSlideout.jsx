import AdminSlideoutInfoSection from "../AdminSlideoutInfoSection/AdminSlideoutInfoSection";
import styles from "./AdminSlideout.module.css";

import { FaXmark } from "react-icons/fa6";

export default function AdminSlideout() {
  return (
    <aside className={styles.slideout}>
      <header className={styles.header}>
        <h2 className={styles.headingSecondary}></h2>
        <button type="button" className={styles.closeBtn}>
          <FaXmark />
        </button>
      </header>

      <div className={styles.content}>
        <div className={styles.entryInfo}>
          <AdminSlideoutInfoSection entryType="songs" topData={{}} />
          <div className={styles.entryInputs}></div>
        </div>

        <hr className={styles.hr} />

        <div className={styles.actions}>
          <div className={styles.actionsBtns}></div>
        </div>
      </div>
    </aside>
  );
}
