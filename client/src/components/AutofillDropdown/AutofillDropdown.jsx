import { forwardRef, memo } from "react";
import styles from "./AutofillDropdown.module.css";
import classNames from "classnames";

const AutofillDropdown = memo(
  forwardRef(
    ({ suggestions, selectedIndex, onSelect, type = "search" }, ref) => {
      return (
        <ul
          className={classNames(
            styles.autocompleteDropdown,
            styles.show,
            styles[type]
          )}
          ref={ref}
        >
          {suggestions.map((item, index) => (
            <li
              key={`${item}${index}`}
              data-index={index}
              className={classNames({
                [styles.selected]: index === selectedIndex,
              })}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              onClick={() => onSelect(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      );
    }
  )
);

export default AutofillDropdown;
