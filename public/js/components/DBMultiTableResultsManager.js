import { DBViewSortSelectManager } from "./Components.js";
import { EventBinder } from "./Components.js";
import { ValidateOptions } from "./Components.js";
import { DBViewManager } from "./Components.js";
import { DBPageStateManager } from "./Components.js";
import { DBPageDOMManager } from "./Components.js";
import { DBViewFilterManager } from "./DBViewFilterManager.js";

// Delegates management of multi table results, delegates selecting
// tables, sorting, filtering, view table, and page state
export class DBMultiTableResultsManager {
  #viewManager;
  #pageStateManager;
  #tableSelectElement;
  #eventBinder;
  #tableConfig;
  #saveTableInSession;
  #updateURL;
  #sortingEnabled;
  #sortOptions;
  #sortManager = null;
  #filterEnabled;
  #filterOptions;
  #filterManager = null;

  constructor({
    viewManager,
    pageStateManager,
    tableSelectElement,
    tableConfig,
    saveTableInSession = false,
    updateURL = false,
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
    const validator = new ValidateOptions();

    validator.validateAll([
      { value: viewManager, type: "instance", instance: DBViewManager },
      {
        value: pageStateManager,
        type: "instance",
        instance: DBPageStateManager,
      },
      {
        value: tableSelectElement,
        type: "instance",
        instance: HTMLSelectElement,
      },
      { value: tableConfig, type: "object" },
    ]);

    this.#viewManager = viewManager;
    this.#pageStateManager = pageStateManager;
    this.#tableSelectElement = tableSelectElement;
    this.#eventBinder = new EventBinder();
    this.#tableConfig = tableConfig;
    this.#saveTableInSession = saveTableInSession;
    this.#updateURL = updateURL;
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
    const initialTable = this.#pageStateManager.getInitialTable();
    this.#tableSelectElement.value = initialTable;

    await this.loadTable(initialTable);

    this.#bindEvents();
  }

  #clearFilterInput() {
    if (this.#filterEnabled && this.#filterOptions.filterInputElement) {
      this.#filterOptions.filterInputElement.value = "";
    }
  }

  async loadTable(tableName, sortKey = "", sortDir = "") {
    if (!this.#tableConfig[tableName]) {
      throw new Error(`Unknown table: ${tableName}`);
    }

    if (this.#saveTableInSession) {
      this.#pageStateManager.saveTableInSessionStorage(tableName);
    }

    if (this.#updateURL) {
      this.#pageStateManager.updateURL(tableName);
    }

    await this.#viewManager.loadTable(tableName, sortKey, sortDir);

    this.#clearFilterInput();

    if (this.#sortingEnabled) {
      if (this.#sortManager) {
        this.#sortManager.destroy();
        this.#sortManager = null;
      }

      const sortKeys = this.#tableConfig[tableName]?.sortKeys || [];

      this.#sortManager = new DBViewSortSelectManager({
        selectElement: this.#sortOptions.selectElement,
        sortDirectionButton: this.#sortOptions.toggleButton,
        sortKeys,
        defaultOption: this.#sortOptions.defaultOption,
        onSelectCallback: async (key, dir) => {
          await this.loadTable(tableName, key, dir);
        },
      });
    }

    if (this.#filterEnabled) {
      if (this.#filterManager) {
        this.#filterManager.destroy();
        this.#filterManager = null;
      }

      const filterForKeys = this.#tableConfig[tableName].filterForKeys || [];
      const filterSelector = this.#tableConfig[tableName].filterSelector || "";

      this.#filterManager = new DBViewFilterManager({
        filterInputElement: this.#filterOptions.filterInputElement,
        filterSelector: `.${filterSelector}`,
        filterForKeys,
        filterClearBtnElement: this.#filterOptions.filterClearBtnElement,
        onFilterCallback: (entry, matchFound) => {
          DBPageDOMManager.toggleElementVisibility(entry, matchFound);
        },
      });
    }
  }

  async #handlePopState() {
    const table = this.#pageStateManager.getCurrentTableFromURL();
    this.#tableSelectElement.value = table;
    await this.loadTable(table);
  }

  #bindEvents() {
    this.#eventBinder.bind(this.#tableSelectElement, "change", () =>
      this.loadTable(this.#tableSelectElement.value)
    );

    this.#eventBinder.bind(window, "popstate", () => this.#handlePopState());
  }
}
