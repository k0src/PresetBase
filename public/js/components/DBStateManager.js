export class DBStateManager {
  static getState(page, storageKey) {
    const state = sessionStorage.getItem(`${page}-${storageKey}`);
    return state ? JSON.parse(state) : null;
  }

  static setState(page, { storageKey, value }) {
    sessionStorage.setItem(`${page}-${storageKey}`, JSON.stringify(value));
  }

  static clearState(page) {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(`${page}-`)) {
        sessionStorage.removeItem(key);
      }
    }
  }
}
