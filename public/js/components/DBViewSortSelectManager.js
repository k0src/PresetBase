export class DBViewSortSelectManager {
  #select;
  #sortDirectionButton;
  #sortKeys;
  #defaultOption;
  #sortDirection;
  #onSelectCallback;

  #boundHandleSelectChange;
  #boundHandleSortDirectionToggle;

  constructor(options) {
    const {
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
    } = options;

    if (!(selectElement instanceof HTMLSelectElement)) {
      throw new Error("Select Element must be an HTMLSelectElement.");
    }

    if (!Array.isArray(sortKeys)) {
      throw new Error("sortKeys must be an array.");
    }

    this.#select = selectElement;
    this.#sortDirectionButton = sortDirectionButton;
    this.#sortKeys = sortKeys;
    this.#defaultOption = defaultOption;
    this.#sortDirection = "ASC";
    this.#onSelectCallback = onSelectCallback;

    this.#boundHandleSelectChange = this.#handleSelectChange.bind(this);
    this.#boundHandleSortDirectionToggle =
      this.#handleSortDirectionToggle.bind(this);

    this.#init();
  }

  destroy() {
    this.#select.removeEventListener("change", this.#boundHandleSelectChange);
    if (this.#sortDirectionButton) {
      this.#sortDirectionButton.removeEventListener(
        "click",
        this.#boundHandleSortDirectionToggle
      );
    }

    this.#select.value = "";
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

  #handleSelectChange() {
    const selectedValue = this.#select.value;

    if (this.#onSelectCallback) {
      this.#onSelectCallback(selectedValue, this.#sortDirection);
    }
  }

  #handleSortDirectionToggle() {
    if (!this.#sortDirectionButton) return;

    this.#sortDirection = this.#sortDirection === "ASC" ? "DESC" : "ASC";
    this.#handleSelectChange();
  }

  #bindEvents() {
    this.#select.addEventListener("change", this.#boundHandleSelectChange);

    if (this.#sortDirectionButton) {
      this.#sortDirectionButton.addEventListener(
        "click",
        this.#boundHandleSortDirectionToggle
      );
    }
  }
}
