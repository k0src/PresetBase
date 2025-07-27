import { EventBinder } from "./Components.js";
import { ValidateOptions } from "./Components.js";

export class DBViewFilterManager {
  #filterInputElement;
  #filterClearBtnElement;
  #filterForKeys;
  #filterSelector;
  #onFilterCallback;
  #eventBinder;

  constructor({
    filterInputElement,
    filterSelector,
    filterForKeys = [],
    filterClearBtnElement = null,
    onFilterCallback = null,
  }) {
    const validator = new ValidateOptions();
    validator.validateAll([
      {
        value: filterInputElement,
        type: "instance",
        instance: HTMLInputElement,
      },
      { value: filterForKeys, type: "array" },
    ]);

    this.#filterInputElement = filterInputElement;
    this.#filterSelector = filterSelector;
    this.#filterClearBtnElement = filterClearBtnElement;
    this.#filterForKeys = filterForKeys;
    this.#onFilterCallback = onFilterCallback;
    this.#eventBinder = new EventBinder();

    this.#filterInputElement.value = "";

    this.#bindEvents();
  }

  destroy() {
    this.#filterInputElement.value = "";
    this.#eventBinder.unbindAll();
  }

  clearFilterInput() {
    this.#filterInputElement.value = "";
    this.#handleFilterResults(this.#filterInputElement.value);
  }

  get filterInputElement() {
    return this.#filterInputElement;
  }

  get filterInput() {
    return this.#filterInputElement.value;
  }

  #handleFilterResults = (query) => {
    const lowerQuery = query.trim().toLowerCase();

    document.querySelectorAll(this.#filterSelector).forEach((entry) => {
      const matchFound = this.#filterForKeys.some((key) => {
        const el = entry.querySelector(`[data-filterkey="${key}"]`);
        return el && el.textContent.toLowerCase().includes(lowerQuery);
      });

      if (lowerQuery && !matchFound) {
        this.#onFilterCallback?.(entry, false);
      } else {
        this.#onFilterCallback?.(entry, true);
      }
    });
  };

  #handleClearInput = () => {
    this.#filterInputElement.value = "";
    this.#handleFilterResults("");
  };

  #bindEvents() {
    this.#eventBinder.bind(this.#filterInputElement, "input", (e) =>
      this.#handleFilterResults(e.target.value)
    );

    if (this.#filterClearBtnElement) {
      this.#eventBinder.bind(
        this.#filterClearBtnElement,
        "click",
        this.#handleClearInput
      );
    }
  }
}
