import { ValidateOptions } from "./componets.js";

// View manager for dynamically created EJS table views
export class DBViewManager {
  #config;
  #currentTable;
  #tableOptions;
  #fetchTableData;
  #listContainer;

  constructor({
    config,
    tableOptions = {
      renderHeaderNumberColumn: false,
      headerNumberColumnTextContent: "",
      renderRowNumber: false,
    },
    currentTable = null,
    fetchTableData,
    listContainer,
  }) {
    const validator = new ValidateOptions();
    validator.validateAll([
      { value: listContainer, type: "instance", instance: HTMLElement },
      { value: config, type: "object" },
      { value: fetchTableData, type: "function" },
    ]);

    this.#config = config;
    this.#currentTable = currentTable;
    this.#tableOptions = {
      renderHeaderNumberColumn: tableOptions.renderHeaderNumberColumn,
      headerNumberColumnTextContent: tableOptions.headerNumberColumnTextContent,
      renderRowNumber: tableOptions.renderRowNumber,
    };
    this.#fetchTableData = fetchTableData;
    this.#listContainer = listContainer;
  }

  async loadTable(tableName, sortKey = "", sortDirection = "") {
    try {
      const tableConfig = this.#config[tableName];
      if (!tableConfig) {
        throw new Error(`Unknown table: ${tableName}`);
      }

      const tableData = await this.#fetchTableData(
        tableName,
        sortKey,
        sortDirection
      );

      this.#currentTable = tableName;
      this.#listContainer.innerHTML = "";
      await this.#renderTableHeader(tableConfig.columns, tableConfig);
      await this.#renderTableRows(tableData, tableConfig);
    } catch (err) {
      throw new Error(`Failed to load table ${tableName}: ${err.message}`);
    }
  }

  get currentTable() {
    return this.#currentTable;
  }

  get listContainer() {
    return this.#listContainer;
  }

  async #renderTableHeader(tableColumns, tableConfig) {
    const header = document.createElement("div");
    header.className = tableConfig.headerClassName;

    if (this.#tableOptions.renderHeaderNumberColumn) {
      const numberColumn = document.createElement("span");
      numberColumn.textContent =
        this.#tableOptions.headerNumberColumnTextContent || "#";
      header.appendChild(numberColumn);
    }

    for (const col of tableColumns) {
      const column = document.createElement("span");
      column.textContent = col.label || "";
      header.appendChild(column);
    }

    this.#listContainer.appendChild(header);
  }

  async #renderTableRows(tableData, tableConfig) {
    tableData.forEach((row, i) => {
      const rowEl = document.createElement("div");
      rowEl.className = tableConfig.entryClassName;

      if (this.#tableOptions.renderRowNumber) {
        const numberColumn = document.createElement("span");
        numberColumn.className = tableConfig.rowNumberClassName;
        numberColumn.textContent = i + 1;
        rowEl.appendChild(numberColumn);
      }

      tableConfig.columns.forEach((column) => {
        const columnEl = document.createElement("span");
        columnEl.className = column.className;
        columnEl.textContent = row[column.key];
        rowEl.appendChild(columnEl);
      });

      tableConfig.actions.forEach((action) => {
        if (action.type === "button") {
          const button = document.createElement("button");
          button.type = "button";
          button.className = action.className || "";
          button.textContent = action.label || "";
          button.innerHTML = action.content || "";
          button.addEventListener("click", () => {
            action.callback(row, this.#currentTable);
          });

          rowEl.appendChild(button);
        } else if (action.type === "link") {
          const link = document.createElement("a");
          link.href = action.href(row[action.hrefKey] || "");
          link.className = action.className || "";
          link.textContent = action.label || "";
          link.innerHTML = action.content || "";

          link.addEventListener("click", (e) => {
            e.preventDefault();
            action.callback(row, this.#currentTable);
          });

          rowEl.appendChild(link);
        } else {
          throw new Error(`Unknown action type: ${action.type}`);
        }
      });
      this.#listContainer.appendChild(rowEl);
    });
  }
}
