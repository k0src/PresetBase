import { ValidateOptions } from "./Components.js";
import { EventBinder } from "./Components.js";

export class AutofillDropdownManager {
  #input;
  #dropdown;
  #onSelectCallback;
  #limit;
  #shouldAutofillInput;
  #fetchResults;
  #hideDropdownOnClickOff;
  #debounceDelay;
  #classes;
  #selectedIndex;
  #debounceTimeout;
  #loopNavigation;
  #eventBinder;

  constructor(options) {
    const {
      fetchResults,
      inputElement,
      dropdownElement,
      onSelectCallback = null,
      resultsLimit = null,
      shouldAutofillInput = true,
      hideDropdownOnClickOff = true,
      loopNavigation = true,
      debounceDelay = 150,
    } = options;

    const validator = new ValidateOptions();
    validator.validateAll([
      { value: inputElement, type: "instance", instance: HTMLInputElement },
      { value: dropdownElement, type: "instance", instance: HTMLElement },
      { value: fetchResults, type: "function" },
    ]);

    this.#input = inputElement;
    this.#dropdown = dropdownElement;
    this.#onSelectCallback = onSelectCallback;
    this.#limit = resultsLimit;
    this.#shouldAutofillInput = shouldAutofillInput;
    this.#fetchResults = fetchResults;
    this.#hideDropdownOnClickOff = hideDropdownOnClickOff;
    this.#loopNavigation = loopNavigation;
    this.#debounceDelay = debounceDelay;
    this.#selectedIndex = -1;
    this.#debounceTimeout = null;

    this.#classes = {
      show: "show",
      hidden: "hidden",
      selected: "selected",
    };

    this.#eventBinder = new EventBinder();
    this.#bindEvents();
  }

  get dropdownElement() {
    return this.#dropdown;
  }

  destroy() {
    clearTimeout(this.#debounceTimeout);
    this.#eventBinder.unbindAll();
  }

  async #fetchAutofillResults(query) {
    try {
      return await this.#fetchResults(query, this.#limit);
    } catch (err) {
      throw new Error(`Failed to fetch autofill results: ${err.message}`);
    }
  }

  async #handleKeyboardNavigation(e) {
    const dropdownItems = this.#dropdown.querySelectorAll("li");
    if (!dropdownItems.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.#selectedIndex =
          this.#selectedIndex < dropdownItems.length - 1
            ? this.#selectedIndex + 1
            : this.#loopNavigation
            ? 0
            : dropdownItems.length - 1;
        this.#updateDropdownSelection(dropdownItems);
        break;

      case "ArrowUp":
        e.preventDefault();
        this.#selectedIndex =
          this.#selectedIndex > 0
            ? this.#selectedIndex - 1
            : this.#loopNavigation
            ? dropdownItems.length - 1
            : 0;
        this.#updateDropdownSelection(dropdownItems);
        break;

      case "Enter":
        e.preventDefault();
        if (this.#selectedIndex >= 0) {
          const item = dropdownItems[this.#selectedIndex];
          const label = item.textContent;
          const id = item.getAttribute("data-id");
          this.#hideDropdown();
          this.#setInputValue(label);
          this.#selectedIndex = -1;
          await this.#onSelectCallback?.({ label, id });
        }
        break;

      case "Escape":
        this.#hideDropdown();
        this.#selectedIndex = -1;
        break;
    }
  }

  #updateDropdownSelection(items) {
    items.forEach((item) => item.classList.remove(this.#classes.selected));

    if (this.#selectedIndex >= 0 && items[this.#selectedIndex]) {
      const selected = items[this.#selectedIndex];
      selected.classList.add(this.#classes.selected);
      selected.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  #handleInput = () => {
    clearTimeout(this.#debounceTimeout);
    this.#debounceTimeout = setTimeout(async () => {
      const query = this.#input.value.trim();
      if (!query.length) return this.#hideDropdown();

      try {
        const results = await this.#fetchAutofillResults(query);
        this.#renderDropdown(results);
      } catch (err) {
        console.error("Error fetching autofill suggestions:", err);
      }
    }, this.#debounceDelay);
  };

  #createDropdownItem({ label, id }) {
    const li = document.createElement("li");
    li.textContent = label;
    li.setAttribute("data-id", id);

    this.#eventBinder.bind(li, "click", () => {
      this.#hideDropdown();
      this.#setInputValue(label);
      this.#onSelectCallback?.({ label, id });
    });

    return li;
  }

  #renderDropdown(items) {
    if (!Array.isArray(items)) {
      console.warn("Expected dropdown items to be an array.");
      return;
    }

    this.#dropdown.innerHTML = "";
    if (!items.length) return this.#hideDropdown();

    const fragment = document.createDocumentFragment();
    items.forEach((item) =>
      fragment.appendChild(this.#createDropdownItem(item))
    );
    this.#dropdown.appendChild(fragment);
    this.#showDropdown();
  }

  #hideDropdown() {
    this.#dropdown.classList.remove(this.#classes.show);
    this.#dropdown.classList.add(this.#classes.hidden);
  }

  #showDropdown() {
    this.#dropdown.classList.add(this.#classes.show);
    this.#dropdown.classList.remove(this.#classes.hidden);
  }

  #setInputValue(value) {
    if (!this.#shouldAutofillInput) return;
    this.#input.value = value;
    this.#input.dispatchEvent(new Event("input"));
  }

  #handleOutsideClicks = (e) => {
    if (!this.#input.contains(e.target) && !this.#dropdown.contains(e.target)) {
      this.#hideDropdown();
    }
  };

  #bindEvents() {
    this.#eventBinder.bind(this.#input, "input", this.#handleInput);
    this.#eventBinder.bind(this.#input, "keydown", (e) =>
      this.#handleKeyboardNavigation(e)
    );

    if (this.#hideDropdownOnClickOff) {
      this.#eventBinder.bind(document, "click", this.#handleOutsideClicks);
    }
  }
}
