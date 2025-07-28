import { EventBinder } from "../EventBinder.js";
import { DBStateManager } from "../DBStateManager.js";
import { DBViewSortSelectManager } from "../DBViewSortSelectManager.js";
import { DBViewFilterManager } from "../DBViewFilterManager.js";
import { DBPageDOMManager } from "../DBPageDOMManager.js";

export class DBTableResultsManager {
  constructor(viewManager, domManager) {
    this.viewManager = viewManager;
    this.domManager = domManager;
    this.eventBinder = new EventBinder();
    this.sortManager = null;
    this.filterManager = null;
  }

  get stateKey() {
    throw new Error("stateKey getter must be implemented by subclass");
  }

  get sortKeys() {
    return [];
  }

  get filterKeys() {
    return [];
  }

  get filterSelector() {
    return "";
  }

  async init() {
    const savedSortState = DBStateManager.getState(this.stateKey, "sort");
    let sortKey = savedSortState?.key || "";
    let sortDir = savedSortState?.direction || "";

    this.setupSorting(sortKey);
    this.setupFiltering();
    await this.loadTable(sortKey, sortDir);
  }

  setupSorting(sortKey) {
    if (this.sortKeys.length === 0) return;

    this.sortManager = new DBViewSortSelectManager({
      selectElement: this.domManager.getElement("sortSelect"),
      sortDirectionButton: this.domManager.getElement("sortToggleBtn"),
      sortKeys: this.sortKeys,
      defaultOption: {
        label: "Sort",
        value: "",
        disabled: true,
        selected: true,
        hidden: true,
      },
      onSelectCallback: async (key, dir) => {
        await this.loadTable(key, dir);
      },
    });

    if (sortKey && this.domManager.getElement("sortSelect")) {
      this.domManager.getElement("sortSelect").value = sortKey;
    }
  }

  setupFiltering() {
    if (this.filterKeys.length === 0) return;

    this.filterManager = new DBViewFilterManager({
      filterInputElement: this.domManager.getElement("filterInput"),
      filterSelector: `.${this.filterSelector}`,
      filterForKeys: this.filterKeys,
      filterClearBtnElement: this.domManager.getElement("filterClearBtn"),
      onFilterCallback: (entry, matchFound) => {
        DBPageDOMManager.toggleElementVisibility(entry, matchFound);
      },
    });
  }

  async loadTable(sortKey = "", sortDir = "") {
    if (sortKey || sortDir) {
      DBStateManager.setState(this.stateKey, {
        storageKey: "sort",
        value: { key: sortKey, direction: sortDir },
      });
    }

    await this.viewManager.loadTable(sortKey, sortDir);
    this.clearFilterInput();
  }

  clearFilterInput() {
    const filterInput = this.domManager.getElement("filterInput");
    if (filterInput) {
      filterInput.value = "";
    }
  }

  destroy() {
    if (this.sortManager) {
      this.sortManager.destroy();
      this.sortManager = null;
    }
    if (this.filterManager) {
      this.filterManager.destroy();
      this.filterManager = null;
    }
    this.eventBinder.unbindAll();
  }
}
