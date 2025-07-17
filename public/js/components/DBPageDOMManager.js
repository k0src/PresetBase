export class DBPageDOMManager {
  #elements;

  constructor(selectors) {
    this.#elements = {};

    for (const [key, selector] of Object.entries(selectors)) {
      const el = document.querySelector(selector);
      if (!el) {
        throw new Error(`Element not found: ${selector}`);
      }
      this.#elements[key] = el;
    }
  }

  static removeElementFromDOM(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    } else {
      throw new Error("Element not found.");
    }
  }

  static toggleElementVisibility(element, isVisible, hiddenClass = "hidden") {
    if (isVisible) {
      element.classList.remove(hiddenClass);
    } else {
      element.classList.add(hiddenClass);
    }
  }

  getElement(key) {
    if (!this.#elements[key]) {
      throw new Error(`Unknown DOM element key: ${key}`);
    }
    return this.#elements[key];
  }

  hasElement(key) {
    return !!this.#elements[key];
  }

  getAll() {
    return this.#elements;
  }
}
