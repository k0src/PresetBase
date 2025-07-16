import { DBViewSortSelectManager } from "./componets.js";
import { DBEventBinder } from "./componets.js";
import { ValidateOptions } from "./componets.js";
import { DBViewManager } from "./componets.js";
import { DBPageStateManager } from "./componets.js";

// Delegates management of multi table results, delegates selecting
// tables, sorting, filtering, view table, and page state
export class DBMultiTableResultsManager {
  #viewManager;
  #pageStateManager;
  #tableSelectElement;
  #sortManager = null;
  #eventBinder;
  #tableConfig;
  #sortingEnabled;
  #saveTableInSession;
  #updateURL;
  #sortOptions;

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
    this.#eventBinder = new DBEventBinder();
    this.#tableConfig = tableConfig;
    this.#sortingEnabled = sortingEnabled;
    this.#saveTableInSession = saveTableInSession;
    this.#updateURL = updateURL;
    this.#sortOptions = {
      selectElement: sortOptions.selectElement,
      toggleButton: sortOptions.toggleButton,
      defaultOption: sortOptions.defaultOption,
    };
  }

  async init() {
    const initialTable = this.#pageStateManager.getInitialTable();
    this.#tableSelectElement.value = initialTable;

    await this.loadTable(initialTable);

    this.#bindEvents();
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
          await this.#viewManager.loadTable(tableName, key, dir);
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
