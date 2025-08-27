import { forwardRef, memo } from "react";
import styles from "./AutofillDropdown.module.css";
import classNames from "classnames";

const AutofillDropdown = memo(
  forwardRef(
    ({ suggestions, selectedIndex, onSelect, type = "search" }, ref) => {
      return (
        suggestions && (
          <ul
            className={classNames(
              styles.autocompleteDropdown,
              styles.show,
              styles[type]
            )}
            ref={ref}
          >
            {suggestions.map((item, index) => {
              const { id, label } =
                typeof item === "object"
                  ? item
                  : { id: undefined, label: item };

              return (
                <li
                  key={`${label}${index}`}
                  data-index={index}
                  id={id}
                  className={classNames({
                    [styles.selected]: index === selectedIndex,
                  })}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  onClick={() => onSelect(item)}
                >
                  {label}
                </li>
              );
            })}
          </ul>
        )
      );
    }
  )
);

export default AutofillDropdown;
