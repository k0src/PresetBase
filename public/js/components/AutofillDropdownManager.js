import { ValidateOptions } from "./componets.js";

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

    this.#classes = {
      show: "show",
      hidden: "hidden",
      selected: "selected",
    };

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

    this.#bindEvents();
  }

  get dropdownElement() {
    return this.#dropdown;
  }

  destroy() {
    this.#unbindEvents();
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
        if (this.#selectedIndex < dropdownItems.length - 1) {
          this.#selectedIndex++;
        } else {
          this.#selectedIndex = this.#loopNavigation
            ? 0
            : dropdownItems.length - 1;
        }
        this.#updateDropdownSelection(dropdownItems);
        break;

      case "ArrowUp":
        e.preventDefault();
        if (this.#selectedIndex > 0) {
          this.#selectedIndex--;
        } else {
          this.#selectedIndex = this.#loopNavigation
            ? dropdownItems.length - 1
            : 0;
        }
        this.#updateDropdownSelection(dropdownItems);
        break;

      case "Enter":
        e.preventDefault();
        if (this.#selectedIndex >= 0 && dropdownItems[this.#selectedIndex]) {
          const selectedValue = dropdownItems[this.#selectedIndex].textContent;
          const selectedValueID =
            dropdownItems[this.#selectedIndex].getAttribute("data-id");
          this.#hideDropdown();
          this.#setInputValue(selectedValue);
          this.#selectedIndex = -1;
          if (this.#onSelectCallback) {
            await this.#onSelectCallback?.({
              label: selectedValue,
              id: selectedValueID,
            });
          }
        }
        break;

      case "Escape":
        this.#hideDropdown();
        this.#selectedIndex = -1;
        break;
    }
  }

  #updateDropdownSelection(dropdownItems) {
    dropdownItems.forEach((item) => {
      item.classList.remove(this.#classes.selected);
    });

    if (this.#selectedIndex >= 0 && dropdownItems[this.#selectedIndex]) {
      const selectedItem = dropdownItems[this.#selectedIndex];
      selectedItem.classList.add(this.#classes.selected);
      selectedItem.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }

  #handleInput() {
    clearTimeout(this.#debounceTimeout);
    this.#debounceTimeout = setTimeout(async () => {
      try {
        const query = this.#input.value.trim();

        if (!query.length) {
          this.#hideDropdown();
          return;
        }

        const results = await this.#fetchAutofillResults(query);
        this.#renderDropdown(results);
      } catch (err) {
        console.error("Error fetching autofill suggestions: ", err);
        throw err;
      }
    }, this.#debounceDelay);
  }

  #createDropdownItem({ label, id }) {
    const li = document.createElement("li");
    li.textContent = label;
    li.setAttribute("data-id", id);
    li.addEventListener("click", () => {
      this.#hideDropdown();
      this.#setInputValue(label);
      this.#onSelectCallback?.({ label, id });
    });
    return li;
  }

  #renderDropdown(dropdownItems) {
    if (!Array.isArray(dropdownItems)) {
      console.warn("Expected dropdownItems to be an array.");
      return;
    }

    this.#dropdown.innerHTML = "";
    if (!dropdownItems.length) {
      this.#hideDropdown();
      return;
    }

    const fragment = document.createDocumentFragment();
    dropdownItems.forEach((item) => {
      fragment.appendChild(this.#createDropdownItem(item));
    });

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

  #handleOutsideClicks(e) {
    if (!this.#input.contains(e.target) && !this.#dropdown.contains(e.target)) {
      this.#hideDropdown();
    }
  }

  #bindEvents() {
    this.handleInput = this.#handleInput.bind(this);
    this.handleOutsideClicks = this.#handleOutsideClicks.bind(this);
    this.handleKeydown = (e) => this.#handleKeyboardNavigation(e);

    if (this.#hideDropdownOnClickOff) {
      document.addEventListener("click", this.handleOutsideClicks);
    }

    this.#input.addEventListener("keydown", this.handleKeydown);
    this.#input.addEventListener("input", this.handleInput);
  }

  #unbindEvents() {
    if (this.#hideDropdownOnClickOff) {
      document.removeEventListener("click", this.handleOutsideClicks);
    }

    this.#input.removeEventListener("keydown", this.handleKeydown);
    this.#input.removeEventListener("input", this.handleInput);
  }
}
