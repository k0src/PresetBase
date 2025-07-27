import { EventBinder } from "./EventBinder.js";

export class DBResultsManager {
  #tableConfig;
  #viewManager;
  #eventBinder;
  #sortingEnabled;
  #sortOptions;
  #sortManager = null;
  #filterEnabled;
  #filterOptions;
  #filterManager = null;

  constructor({
    tableConfig,
    viewManager,
    sortingEnabled = false,
    sortOptions = {
      selectElement: null,
      toggleButton: null,
      defaultOption: {
        label: "Sort",
        value: "",
        disabled: true,
        selected: true,
        hidden: true,
      },
    },
    filterEnabled = false,
    filterOptions = {
      filterInputElement: null,
      filterClearBtnElement: null,
    },
  }) {
    this.#tableConfig = tableConfig;
    this.#viewManager = viewManager;
    this.#eventBinder = new EventBinder();
    this.#sortingEnabled = sortingEnabled;
    this.#sortOptions = {
      selectElement: sortOptions.selectElement,
      toggleButton: sortOptions.toggleButton,
      defaultOption: sortOptions.defaultOption,
    };
    this.#filterEnabled = filterEnabled;
    this.#filterOptions = {
      filterInputElement: filterOptions.filterInputElement,
      filterClearBtnElement: filterOptions.filterClearBtnElement,
    };
  }

  async init() {
    throw new Error(
      "DBResultsManager is an abstract class. Implement init() in subclass."
    );
  }

  async loadTable(sortKey = "", sortDir = "") {
    throw new Error(
      "DBResultsManager is an abstract class. Implement loadTable() in subclass."
    );
  }

  _getTableConfig() {
    return this.#tableConfig;
  }

  _getViewManager() {
    return this.#viewManager;
  }

  _getSortingEnabled() {
    return this.#sortingEnabled;
  }

  _getSortOptions() {
    return this.#sortOptions;
  }

  _getFilterEnabled() {
    return this.#filterEnabled;
  }

  _getFilterOptions() {
    return this.#filterOptions;
  }

  _setSortManager(manager) {
    this.#sortManager = manager;
  }

  _getSortManager() {
    return this.#sortManager;
  }

  _setFilterManager(manager) {
    this.#filterManager = manager;
  }

  _getFilterManager() {
    return this.#filterManager;
  }

  _clearFilterInput() {
    if (this.#filterEnabled && this.#filterOptions.filterInputElement) {
      this.#filterOptions.filterInputElement.value = "";
    }
  }

  destroy() {
    if (this.#sortManager) {
      this.#sortManager.destroy();
      this.#sortManager = null;
    }
    if (this.#filterManager) {
      this.#filterManager.destroy();
      this.#filterManager = null;
    }
    this.#eventBinder.unbindAll();
  }
}
