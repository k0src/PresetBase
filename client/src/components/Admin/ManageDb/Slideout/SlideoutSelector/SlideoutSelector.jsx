import AutofillDropdown from "../../../../AutofillDropdown/AutofillDropdown";
import styles from "./SlideoutSelector.module.css";
import classNames from "classnames";

import { FaCaretDown, FaPlus } from "react-icons/fa6";

export default function SlideoutSelector({ label, defaultValue, placeholder }) {
  return (
    <div className={styles.selectorContainer}>
      <span className={styles.labelText}>{label}</span>
      <div className={styles.textContainer}>
        <span className={styles.selectorText}>{defaultValue}</span>
        <FaCaretDown className={styles.selectorIcon} />
      </div>
      <div className={styles.dropDownContainer}>
        <input
          type="text"
          className={styles.filterInput}
          placeholder={placeholder}
        />
        {/* <AutofillDropdown /> */}

        <div className={styles.divider}></div>
        <div className={styles.addBtnContainer}>
          <button type="button" className={styles.addBtn}>
            <FaPlus />
          </button>
        </div>
      </div>
    </div>
  );
}
