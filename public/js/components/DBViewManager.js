export class DBViewManager {
  constructor({ tableConfig, fetchTableData, listContainer }) {
    this.tableConfig = tableConfig;
    this.fetchTableData = fetchTableData;
    this.listContainer = listContainer;
  }

  async loadTable(sortKey = "", sortDirection = "") {
    throw new Error("DBViewManager is an abstract class.");
  }
}
