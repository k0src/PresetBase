export class DBTableCSVDownloadManager {
  #csvExportDelimiter;
  #csvExportQuote;

  constructor(csvExportDelimiter = ",", csvExportQuote = '"') {
    this.#csvExportDelimiter = csvExportDelimiter;
    this.#csvExportQuote = csvExportQuote;
  }

  generateCSVData(rawTableData, dbRowClassName) {
    const rows = Array.from(rawTableData).map((row) => {
      const cells = row.querySelectorAll(dbRowClassName);
      return Array.from(cells)
        .map((cell) => {
          const cellText = cell.textContent || "";
          return `${this.#csvExportQuote}${cellText}${this.#csvExportQuote}`;
        })
        .join(this.#csvExportDelimiter);
    });
    return rows.join("\n");
  }

  downloadCSVData(data, fileName) {
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportCSVData(tableData, dbRowClassName, fileName = "table.csv") {
    if (tableData.length === 0) {
      console.warn("No data to export.");
      return;
    }

    const csvData = this.generateCSVData(tableData, dbRowClassName);
    this.downloadCSVData(csvData, fileName);
  }
}
