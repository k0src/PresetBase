// Click Manager for PresetBase
const { dbRun } = require("./UTIL");

class ClickManager {
  static #tables = {
    albums: { tableName: "album_clicks", idColumn: "album_id" },
    artists: { tableName: "artist_clicks", idColumn: "artist_id" },
    songs: { tableName: "song_clicks", idColumn: "song_id" },
    synths: { tableName: "synth_clicks", idColumn: "synth_id" },
  };

  static async update(table, entryId) {
    const tableInfo = this.#tables[table];
    if (!tableInfo) {
      throw new Error(`Invalid table: ${table}`);
    }

    const now = new Date().toISOString();
    const { tableName, idColumn } = tableInfo;

    const query = `
      INSERT INTO ${tableName} (${idColumn}, clicks, recent_click)
      VALUES (?, 1, ?)
      ON CONFLICT(${idColumn})
      DO UPDATE SET
        clicks = clicks + 1,
        recent_click = excluded.recent_click
    `;

    await dbRun(query, [entryId, now]);
  }
}

module.exports = ClickManager;
