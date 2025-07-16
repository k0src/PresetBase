// View manager for dynamically created EJS table views
export class DBViewManager {
  #config;
  #currentTable;
  #tableOptions;
  #fetchTableData;
  #listContainer;
  #csvExportEnabled;
  #csvExportOptions;

  #boundHandleCSVExport;

  #validateOptions({
    listContainer,
    csvExportEnabled,
    csvExportBtn,
    config,
    fetchTableData,
  }) {
    if (!(listContainer instanceof HTMLElement)) {
      throw new Error("listContainer must be a valid HTMLElement.");
    }

    if (csvExportEnabled && !(csvExportBtn instanceof HTMLElement)) {
      throw new Error("CSV Export Button must be a valid HTMLElement.");
    }

    if (typeof config !== "object") {
      throw new Error("config must be a valid object.");
    }

    if (typeof fetchTableData !== "function") {
      throw new Error("fetchTableData must be a valid function.");
    }
  }

  constructor(options) {
    const {
      config,
      tableOptions = {},
      currentTable = null,
      fetchTableData,
      listContainer,
      csvExportEnabled = false,
      csvExportOptions = {},
    } = options;

    const {
      csvExportBtn,
      dbEntryClassName,
      dbRowClassName,
      useCustomCSVExportFilename = false,
      csvExportFilename = "",
      csvExportDelimiter = ",",
      csvExportQuote = '"',
    } = csvExportOptions;

    const {
      renderHeaderNumberColumn = false,
      headerNumberColumnTextContent = "",
      renderRowNumber = false,
    } = tableOptions;

    this.#validateOptions({
      listContainer,
      csvExportEnabled,
      csvExportBtn,
      config,
      fetchTableData,
    });

    this.#config = config;
    this.#currentTable = currentTable;
    this.#tableOptions = {
      renderHeaderNumberColumn,
      headerNumberColumnTextContent,
      renderRowNumber,
    };
    this.#fetchTableData = fetchTableData;
    this.#listContainer = listContainer;
    this.#csvExportEnabled = csvExportEnabled;
    this.#csvExportOptions = {
      csvExportBtn,
      dbEntryClassName,
      dbRowClassName,
      useCustomCSVExportFilename,
      csvExportFilename,
      csvExportDelimiter,
      csvExportQuote,
    };

    this.#boundHandleCSVExport = this.#handleCSVExport.bind(this);
    this.#bindEvents();
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

  #generateCSVData(tableData) {
    const rows = Array.from(tableData).map((row) => {
      const cells = row.querySelectorAll(this.#csvExportOptions.dbRowClassName);
      return Array.from(cells)
        .map((cell) => {
          const cellText = cell.textContent || "";
          return `${this.#csvExportOptions.csvExportQuote}${cellText}${
            this.#csvExportOptions.csvExportQuote
          }`;
        })
        .join(this.#csvExportOptions.csvExportDelimiter);
    });
    return rows.join("\n");
  }

  #downloadCSVData(data, fileName) {
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  #handleCSVExport() {
    if (!this.#currentTable) {
      throw new Error("Cannot export CSV data. No table loaded.");
    }

    const tableData = this.#listContainer.querySelectorAll(
      this.#csvExportOptions.dbEntryClassName
    );

    if (tableData.length === 0) {
      console.warn("No data to export.");
      return;
    }

    const csvData = this.#generateCSVData(tableData);
    const fileName = this.#csvExportOptions.useCustomCSVExportFilename
      ? this.#csvExportOptions.csvExportFilename
      : `${this.#currentTable}.csv`;
    this.#downloadCSVData(csvData, fileName);
  }

  #bindEvents() {
    if (this.#csvExportEnabled) {
      this.#csvExportOptions.csvExportBtn.addEventListener(
        "click",
        this.#boundHandleCSVExport
      );
    }
  }
}
