export class DBTableDataManager {
  static async fetchTableData(sortKey = "", sortDirection = "") {
    throw new Error("fetchTableData must be implemented by subclass");
  }
}
