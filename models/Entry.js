// Base DB entry model for PresetBase
const DB = require("./DB.js");

class Entry {
  async save() {
    throw new Error("Method 'save()' must be implemented.");
  }

  async getFullData() {
    throw new Error("Method 'getFullData()' must be implemented.");
  }

  toJSON() {
    throw new Error("Method 'toJSON()' must be implemented.");
  }

  /* ----------------------------- Static Methods ----------------------------- */
  static async create() {
    throw new Error("Method 'create()' must be implemented.");
  }

  static async getById(idi) {
    throw new Error("Method 'getById()' must be implemented.");
  }

  static async deleteById(id) {
    throw new Error("Method 'deleteById()' must be implemented.");
  }

  static async exists(id) {
    throw new Error("Method 'exists()' must be implemented.");
  }

  // Total results of songs, artists, albums, synths, and presets tables
  // Genres, users, etc excluded
  static async totalEntries() {
    try {
      const query = `
        SELECT
          (SELECT COUNT(*) FROM songs) + 
          (SELECT COUNT(*) FROM albums) + 
          (SELECT COUNT(*) FROM artists) +
          (SELECT COUNT(*) FROM synths) +
          (SELECT COUNT(*) FROM presets) 
        AS total_results`;
      const totalResults = await DB.dbGet(query);
      return totalResults ? totalResults.total_results : 0;
    } catch (err) {
      throw new Error(`Error fetching total entries: ${err.message}`);
    }
  }

  static async getAll(sort = null, direction = "ASC") {
    throw new Error("Method 'getAll()' must be implemented.");
  }
}

module.exports = Entry;
