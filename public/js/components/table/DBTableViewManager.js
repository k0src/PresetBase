export class DBTableViewManager {
  constructor(listContainer, dataManager) {
    this.fetchTableData = dataManager.fetchTableData;
    this.listContainer = listContainer;
    this.dataManager = dataManager;
  }

  get columns() {
    throw new Error("columns getter must be implemented by subclass");
  }

  get headerClassName() {
    throw new Error("headerClassName getter must be implemented by subclass");
  }

  get entryClassName() {
    throw new Error("entryClassName getter must be implemented by subclass");
  }

  get rowNumberClassName() {
    throw new Error(
      "rowNumberClassName getter must be implemented by subclass"
    );
  }

  createActionButton(row) {
    return null;
  }

  async loadTable(sortKey = "", sortDirection = "") {
    try {
      const tableData = await this.fetchTableData(sortKey, sortDirection);
      this.listContainer.innerHTML = "";
      this.renderTableHeader();
      this.renderTableRows(tableData);
    } catch (err) {
      throw new Error(`Failed to load table: ${err.message}`);
    }
  }

  renderTableHeader() {
    const header = document.createElement("div");
    header.className = this.headerClassName;

    const numberColumn = document.createElement("span");
    numberColumn.textContent = "#";
    header.appendChild(numberColumn);

    this.columns.forEach((column) => {
      const columnEl = document.createElement("span");
      columnEl.textContent = column.label;
      header.appendChild(columnEl);
    });

    this.listContainer.appendChild(header);
  }

  renderTableRows(tableData) {
    if (!Array.isArray(tableData)) {
      console.warn("Data is not an array:", tableData);
      return;
    }

    tableData.forEach((row, index) => {
      const rowEl = this.createTableRow(row, index);
      this.listContainer.appendChild(rowEl);
    });
  }

  createTableRow(row, index) {
    const rowEl = document.createElement("div");
    rowEl.className = this.entryClassName;
    rowEl.dataset.id = row.id;

    // Row number
    const numberColumn = document.createElement("span");
    numberColumn.className = this.rowNumberClassName;
    numberColumn.textContent = index + 1;
    rowEl.appendChild(numberColumn);

    // Data columns
    this.columns.forEach((column) => {
      const columnEl = document.createElement("span");
      columnEl.className = column.className;
      columnEl.textContent = column.formatValue(row[column.key]);
      columnEl.dataset.filterkey = column.key;
      rowEl.appendChild(columnEl);
    });

    // Action button
    const actionButton = this.createActionButton(row);
    if (actionButton) {
      rowEl.appendChild(actionButton);
    }

    return rowEl;
  }
}
