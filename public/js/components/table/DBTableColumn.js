export class DBTableColumn {
  constructor(key, label, className) {
    this.key = key;
    this.label = label;
    this.className = className;
  }

  formatValue(value) {
    return value || "";
  }
}
