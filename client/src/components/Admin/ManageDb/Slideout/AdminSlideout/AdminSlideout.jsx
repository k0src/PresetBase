import SlideoutInfoSection from "../SlideoutInfoSection/SlideoutInfoSection";
import SlideoutInputSection from "../SlideoutInputSection/SlideoutInputSection";
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
          <SlideoutInfoSection entryType="songs" data={{}} />
          <SlideoutInputSection entryType="songs" data={{}} />
        </div>

        <hr className={styles.hr} />

        <div className={styles.actions}>
          <div className={styles.actionsBtns}>
            <button type="button" className={styles.applyChangesBtn}>
              Apply Changes
            </button>
            <button type="button" className={styles.deleteBtn}>
              Delete Entry
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
