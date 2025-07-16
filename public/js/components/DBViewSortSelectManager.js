import { EventBinder } from "./Components.js";
import { ValidateOptions } from "./Components.js";

export class DBViewSortSelectManager {
  #select;
  #sortDirectionButton;
  #sortKeys;
  #defaultOption;
  #sortDirection;
  #onSelectCallback;
  #eventBinder;

  #boundHandleSelectChange;
  #boundHandleSortDirectionToggle;

  constructor({
    selectElement,
    sortDirectionButton = null,
    sortKeys,
    defaultOption = {
      label: "Sort",
      value: "",
      disabled: true,
      selected: true,
      hidden: true,
    },
    onSelectCallback = null,
  }) {
    const validator = new ValidateOptions();
    validator.validateAll([
      { value: selectElement, type: "instance", instance: HTMLSelectElement },
      {
        value: sortDirectionButton,
        type: "instance",
        instance: HTMLElement,
      },
    ]);

    this.#select = selectElement;
    this.#sortDirectionButton = sortDirectionButton;
    this.#sortKeys = sortKeys;
    this.#defaultOption = defaultOption;
    this.#sortDirection = "ASC";
    this.#onSelectCallback = onSelectCallback;
    this.#eventBinder = new EventBinder();

    this.#init();
  }

  destroy() {
    this.#eventBinder.unbindAll();
    this.#select.value = "";
  }

  get currentSortKey() {
    return this.#select.value;
  }

  get currentSortDirection() {
    return this.#sortDirection;
  }

  #init() {
    this.#populateSelect();
    this.#bindEvents();
  }

  #populateSelect() {
    this.#select.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.textContent = this.#defaultOption.label;
    defaultOption.value = this.#defaultOption.value;
    defaultOption.disabled = this.#defaultOption.disabled;
    defaultOption.selected = this.#defaultOption.selected;
    defaultOption.hidden = this.#defaultOption.hidden;

    this.#select.appendChild(defaultOption);

    this.#sortKeys.forEach((key) => {
      const option = document.createElement("option");
      option.textContent = key.label;
      option.value = key.value;
      option.disabled = key.disabled || false;
      option.selected = key.selected || false;
      option.hidden = key.hidden || false;
      this.#select.appendChild(option);
    });
  }

  #handleSelectChange = () => {
    const selectedValue = this.#select.value;

    if (this.#onSelectCallback) {
      this.#onSelectCallback(selectedValue, this.#sortDirection);
    }
  };

  #handleSortDirectionToggle = () => {
    if (!this.#sortDirectionButton) return;

    this.#sortDirection = this.#sortDirection === "ASC" ? "DESC" : "ASC";
    this.#handleSelectChange();
  };

  #bindEvents() {
    this.#eventBinder.bind(this.#select, "change", this.#handleSelectChange);

    if (this.#sortDirectionButton) {
      this.#eventBinder.bind(
        this.#sortDirectionButton,
        "click",
        this.#handleSortDirectionToggle
      );
    }
  }
}
