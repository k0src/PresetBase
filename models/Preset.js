// Preset DB entry model for PresetBase
const DB = require("./DB.js");
const Entry = require("./Entry.js");

class Preset extends Entry {
  #id;
  #presetName;
  #packName;
  #author;
  #timestamp;

  constructor({ id = null, presetName, packName, author }) {
    this.#id = id;
    this.#presetName = presetName;
    this.#packName = packName;
    this.#author = author;
    this.#timestamp = new Date().toISOString();
  }

  // Save/Update the preset in the DB
  async save() {
    try {
      if (this.#id) {
        return DB.dbRun(
          `UPDATE presets SET preset_name = ?, pack_name = ?, author = ?, timestamp = ? WHERE id = ?`,
          [
            this.#presetName,
            this.#packName,
            this.#author,
            this.#timestamp,
            this.#id,
          ]
        );
      } else {
        return DB.dbRun(
          `INSERT INTO presets (preset_name, pack_name, author, timestamp) VALUES (?, ?, ?, ?)`,
          [this.#presetName, this.#packName, this.#author, this.#timestamp]
        );
      }
    } catch (err) {
      throw new Error(`Error saving preset: ${err.message}`);
    }
  }

  // Get full preset data, including synth
  async getFullData() {
    try {
      const query = `
        SELECT
          presets.id AS preset_id,
          presets.preset_name,
          presets.pack_name,
          presets.author,
          presets.timestamp AS preset_added_timestamp,

          json_object(
            'id', synths.id,
            'synth_name', synths.synth_name,
            'manufacturer', synths.manufacturer,
            'synth_type', synths.synth_type,
            'image_url', synths.image_url,
            'release_year', synths.release_year
          ) AS synth
        FROM presets
        LEFT JOIN preset_synths ON presets.id = preset_synths.preset_id
        LEFT JOIN synths ON preset_synths.synth_id = synths.id
        WHERE presets.id = ?`;

      const presetData = await DB.dbGet(query, [this.#id]);

      if (presetData) {
        presetData.synth = JSON.parse(presetData.synth || "{}");
      }

      return presetData;
    } catch (err) {
      throw new Error(`Error fetching full preset data: ${err.message}`);
    }
  }

  // Returns instance as an object
  toJSON() {
    return {
      id: this.#id,
      presetName: this.#presetName,
      packName: this.#packName,
      author: this.#author,
      timestamp: this.#timestamp,
    };
  }

  // Getters
  get id() {
    return this.#id;
  }

  get presetName() {
    return this.#presetName;
  }

  get packName() {
    return this.#packName;
  }

  get author() {
    return this.#author;
  }

  get timestamp() {
    return this.#timestamp;
  }

  // Setters
  set presetName(name) {
    this.#presetName = name;
  }

  set packName(name) {
    this.#packName = name;
  }

  set author(author) {
    this.#author = author;
  }

  set timestamp(timestamp) {
    this.#timestamp = timestamp;
  }

  /* ----------------------------- Static Methods ----------------------------- */
  // Create, insert, and return a new Preset instance
  static async create({ presetName, packName, author }) {
    try {
      const now = new Date().toISOString();
      const result = await DB.dbRun(
        `INSERT INTO presets (preset_name, pack_name, author, timestamp) VALUES (?, ?, ?, ?)`,
        [presetName, packName, author, now]
      );

      return new Preset({
        id: result.lastID,
        presetName,
        packName,
        author,
        timestamp: now,
      });
    } catch (err) {
      throw new Error(`Error creating Preset: ${err.message}`);
    }
  }

  // Returns new Preset instance from a DB row
  static #fromRow(row) {
    return new Preset({
      id: row.id,
      presetName: row.preset_name,
      packName: row.pack_name,
      author: row.author,
      timestamp: row.timestamp,
    });
  }

  // Get preset by ID
  static async getById(id) {
    try {
      const row = await DB.dbGet(`SELECT * FROM presets WHERE id = ?`, [id]);
      return row ? Preset.#fromRow(row) : null;
    } catch (err) {
      throw new Error(`Error fetching preset by ID: ${err.message}`);
    }
  }

  // Delete preset by ID
  static async deleteById(id) {
    try {
      await Promise.all([
        DB.dbRun(`DELETE FROM presets WHERE id = ?`, [id]),
        DB.dbRun(`DELETE FROM preset_synths WHERE preset_id = ?`, [id]),
        DB.dbRun(`DELETE FROM song_presets WHERE preset_id = ?`, [id]),
      ]);
    } catch (err) {
      throw new Error(`Error deleting preset by ID: ${err.message}`);
    }
  }

  // Return whether preset in DB by ID
  static async exists(id) {
    try {
      const presetId = await DB.dbGet(`SELECT id FROM presets WHERE id = ?`, [
        id,
      ]);
      return !!presetId;
    } catch (err) {
      throw new Error(`Error checking preset existence: ${err.message}`);
    }
  }

  // Get total number of presets in DB
  static async totalEntries() {
    try {
      const totalResults = await DB.dbGet(
        `SELECT COUNT(*) AS total_results FROM presets`
      );
      return totalResults ? totalResults.total_results : 0;
    } catch (err) {
      throw new Error(`Error fetching total entries: ${err.message}`);
    }
  }

  // Get all presets
  static async getAll(sort = "presets.timestamp", direction = "ASC") {
    try {
      // For case-insensitive sorting
      const textFields = [
        "presets.preset_name",
        "presets.pack_name",
        "presets.author",
        "synths.synth_name",
      ];
      const sortClause = textFields.includes(sort)
        ? `${sort} COLLATE NOCASE ${direction}`
        : `${sort} ${direction}`;

      const query = `
        SELECT
          presets.id AS id,
          presets.preset_name AS name,
          presets.pack_name AS packName,
          presets.author AS author,
          presets.timestamp AS timestamp,
          json_object (
            'id', synths.id,
            'name', synths.synth_name,
            'imageUrl', synths.image_url
          ) AS synth
        FROM presets
        LEFT JOIN preset_synths ON presets.id = preset_synths.preset_id
        LEFT JOIN synths ON preset_synths.synth_id = synths.id
        ORDER BY ${sortClause}`;

      const presetsData = await DB.dbAll(query);

      if (presetsData) {
        presetsData.forEach((preset) => {
          preset.synth = JSON.parse(preset.synth || "{}");
        });
      }

      return presetsData;
    } catch (err) {
      throw new Error(`Error fetching all presets: ${err.message}`);
    }
  }
}

module.exports = Preset;
