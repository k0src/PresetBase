import { DBPageStateManager } from "./DBPageStateManager.js";
import { DBViewManager } from "./DBViewManager.js";
import { DBViewSortSelectManager } from "./DBViewSortSelectManager.js";

// Delegates management of multi table results, delegates selecting
// tables, sorting, filtering, view table, and page state
export class DBMultiTableResultsManager {
  #tableSelectElement;
  #updateURL;
  #saveTableInSession;
  #tableConfig;
  #sortingEnabled;
  #sortOptions;
  #pageStateManager;
  #dbViewManager;
  #sortManager;

  #boundHandleSelectChange;
  #boundHandlePopState;

  #validateOptions({
    tableSelectElement,
    sortSelectElement,
    sortToggleBtnElement,
    tableConfig,
    pageStateManager,
    dbViewManager,
  }) {
    if (!(tableSelectElement instanceof HTMLSelectElement)) {
      throw new Error("Table Select Element must be an HTMLSelectElement.");
    }

    if (!(sortSelectElement instanceof HTMLSelectElement)) {
      throw new Error("Sort Select Element must be an HTMLSelectElement.");
    }

    if (!(sortToggleBtnElement instanceof HTMLElement)) {
      throw new Error("Sort Toggle Button Element must be an HTMLElement.");
    }

    if (!tableConfig || typeof tableConfig !== "object") {
      throw new Error("Table Config must be a valid object.");
    }

    if (!(pageStateManager instanceof DBPageStateManager)) {
      throw new Error(
        "Page State Manager must be an instance of DBPageStateManager."
      );
    }

    if (!(dbViewManager instanceof DBViewManager)) {
      throw new Error("DB View Manager must be an instance of DBViewManager.");
    }
  }

  constructor(options) {
    const {
      tableSelectElement,
      updateURL = false,
      saveTableInSession = false,
      tableConfig,
      dbViewManager,
      pageStateManager,
      sortingEnabled = false,
      sortOptions = {},
    } = options;

    const {
      sortSelectElement = null,
      sortToggleBtnElement = null,
      defaultOption = {
        label: "Sort",
        value: "",
        disabled: true,
        selected: true,
        hidden: true,
      },
    } = sortOptions;

    this.#validateOptions({
      tableSelectElement,
      sortSelectElement,
      sortToggleBtnElement,
      tableConfig,
      pageStateManager,
      dbViewManager,
    });

    this.#tableSelectElement = tableSelectElement;
    this.#updateURL = updateURL;
    this.#saveTableInSession = saveTableInSession;
    this.#tableConfig = tableConfig;
    this.#sortingEnabled = sortingEnabled;
    this.#sortOptions = {
      sortSelectElement,
      sortToggleBtnElement,
      defaultOption,
    };
    this.#pageStateManager = pageStateManager;
    this.#dbViewManager = dbViewManager;
    this.#sortManager = null;

    this.#boundHandleSelectChange = this.#handleSelectChange.bind(this);
    this.#boundHandlePopState = this.#handlePopState.bind(this);

    this.#init();
  }

  async #init() {
    const initialTable = this.#pageStateManager.getInitialTable();
    this.#tableSelectElement.value = initialTable;

    await this.loadTable(initialTable, this.#updateURL);

    this.#bindEvents();
  }

  async loadTable(tableName) {
    if (!this.#tableConfig[tableName]) {
      throw new Error(`Table ${tableName} does not exist in the config.`);
    }

    if (this.#saveTableInSession) {
      this.#pageStateManager.saveTableInSessionStorage(tableName);
    }

    if (this.#updateURL) {
      this.#pageStateManager.updateURL(tableName);
    }

    try {
      if (this.#sortingEnabled) {
        if (this.#sortManager) {
          this.#sortManager.destroy();
          this.#sortManager = null;
        }

        await this.#dbViewManager.loadTable(tableName);

        const sortKeys = this.#tableConfig[tableName]?.sortKeys || [];

        this.#sortManager = new DBViewSortSelectManager({
          selectElement: this.#sortOptions.sortSelectElement,
          sortDirectionButton: this.#sortOptions.sortToggleBtnElement,
          sortKeys: sortKeys,
          defaultOption: this.#sortOptions.defaultOption,
          onSelectCallback: async (selectedValue, sortDirection) => {
            await this.#dbViewManager.loadTable(
              tableName,
              selectedValue,
              sortDirection
            );
          },
        });
      }
    } catch (err) {
      console.error(`Error loading table: ${err.message}`);
    }

    this.#dbViewManager.currentTable = tableName;
  }

  #handleSelectChange() {
    this.loadTable(this.#tableSelectElement.value, this.#updateURL);
  }

  async #handlePopState() {
    const pathTable = this.#pageStateManager.getCurrentTableFromURL();

    this.#tableSelectElement.value = pathTable;
    await this.loadTable(pathTable, this.#updateURL);
  }

  #bindEvents() {
    this.#tableSelectElement.addEventListener(
      "change",
      this.#boundHandleSelectChange
    );
    window.addEventListener("popstate", this.#boundHandlePopState);
  }
}
