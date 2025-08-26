import { memo } from "react";

import AutofillDropdown from "../../../../AutofillDropdown/AutofillDropdown";
import styles from "./SlideoutList.module.css";

import { FaPlus, FaXmark } from "react-icons/fa6";

export default function SlideoutList({ label, listItems, hasInput }) {
  const List = memo(({ listItems, hasInput }) => (
    <div className={styles.listEntriesContainer}>
      {listItems.map((item, index) => (
        <div
          key={index}
          className={hasInput ? styles.listEntryDouble : styles.listEntrySingle}
        >
          <div className={styles.listEntryTextWrapper}>
            <span className={styles.listEntryText}>{item.name}</span>
          </div>
          {hasInput && (
            <input
              type="text"
              className={styles.listEntryInput}
              defaultValue={item.input}
            />
          )}
          <button type="button" className={styles.removeBtn}>
            <FaXmark className={styles.removeIcon} />
          </button>
        </div>
      ))}

      <div className={styles.addBtnContainer}>
        <button type="button" className={styles.addBtn}>
          <FaPlus />
        </button>
      </div>
    </div>
  ));

  const renderList = () => <List listItems={listItems} hasInput={hasInput} />;

  return (
    <div className={styles.listContainer}>
      <span className={styles.labelText}>{label}</span>
      <div className={styles.listWrapper}>
        {renderList()}
        {/* <AutofillDropdown /> */}
      </div>
    </div>
  );
}
