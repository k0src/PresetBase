export class DBMultiStateManager {
  #defaultTable;
  #tableURLIndex;
  #saveTableInSession;
  #sessionStorageKey;
  #baseURL;

  constructor({
    defaultTable = "songs",
    tableURLIndex = 1,
    baseURL,
    saveTableInSession = false,
  }) {
    this.#defaultTable = defaultTable;
    this.#tableURLIndex = tableURLIndex;
    this.#baseURL = baseURL;
    this.#saveTableInSession = saveTableInSession;
    this.#sessionStorageKey = "db_current_table";
  }

  getCurrentTableFromURL() {
    return (
      window.location.pathname.split("/")[this.#tableURLIndex] ||
      this.#defaultTable
    );
  }

  getSelectedTableFromSessionStorage() {
    if (!this.#saveTableInSession) {
      throw new Error(
        "Cannot get selected table from session storage. Session storage is not enabled."
      );
    }

    return sessionStorage.getItem(this.#sessionStorageKey);
  }

  saveTableInSessionStorage(tableName) {
    if (!this.#saveTableInSession) {
      throw new Error(
        "Cannot save selected table in session storage. Session storage is not enabled."
      );
    }

    sessionStorage.setItem(this.#sessionStorageKey, tableName);
  }

  updateURL(tableName) {
    const newURL = `${this.#baseURL}/${tableName}`;
    history.pushState({ table: tableName }, "", newURL);
  }

  getInitialTable() {
    const urlTable = this.getCurrentTableFromURL();
    const sessionTable = this.getSelectedTableFromSessionStorage();

    if (sessionTable) {
      return sessionTable;
    } else if (urlTable) {
      return urlTable;
    } else {
      return this.#defaultTable;
    }
  }
}
