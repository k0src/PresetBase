// Synth DB entry model for PresetBase
const DB = require("./DB.js");
const Entry = require("./Entry.js");

class Synth extends Entry {
  #id;
  #synthName;
  #manufacturer;
  #synthType;
  #releaseYear;
  #imageUrl;
  #timestamp;

  constructor({
    id = null,
    synthName,
    manufacturer,
    synthType,
    releaseYear,
    imageUrl,
  }) {
    this.#id = id;
    this.#synthName = synthName;
    this.#manufacturer = manufacturer;
    this.#synthType = synthType;
    this.#releaseYear = releaseYear;
    this.#imageUrl = imageUrl;
    this.#timestamp = new Date().toISOString();
  }

  // Save/Update the synth in the DB
  async save() {
    try {
      if (this.#id) {
        return DB.dbRun(
          `UPDATE synths SET synth_name = ?, manufacturer = ?, synth_type = ?, release_year = ?, image_url = ?, timestamp = ? WHERE id = ?`,
          [
            this.#synthName,
            this.#manufacturer,
            this.#synthType,
            this.#releaseYear,
            this.#imageUrl,
            this.#timestamp,
            this.#id,
          ]
        );
      } else {
        return DB.dbRun(
          `INSERT INTO synths (synth_name, manufacturer, synth_type, release_year, image_url, timestamp) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            this.#synthName,
            this.#manufacturer,
            this.#synthType,
            this.#releaseYear,
            this.#imageUrl,
            this.#timestamp,
          ]
        );
      }
    } catch (err) {
      throw new Error(`Error saving synth: ${err.message}`);
    }
  }

  // Return full synth data, including presets
  async getFullData() {
    try {
      const query = `
        SELECT
          synths.id AS synth_id,
          synths.synth_name,
          synths.manufacturer,
          synths.synth_type,
          synths.image_url,
          synths.release_year AS synth_year,
          synths.timestamp AS synth_added_timestamp,

          json_group_array(
            DISTINCT json_object(
              'preset_id', presets.id,
              'name', presets.preset_name,
              'pack_name', presets.pack_name,
              'preset_author', presets.author,
              'synth_id', synths.id
            )
          ) AS presets

        FROM synths
        LEFT JOIN preset_synths ON synths.id = preset_synths.synth_id
        LEFT JOIN presets ON preset_synths.preset_id = presets.id
        WHERE synths.id = ?
        GROUP BY synths.id`;

      const synthData = await DB.dbGet(query, [this.#id]);

      if (synthData) {
        synthData.presets = JSON.parse(synthData.presets || "[]");
      }

      return synthData;
    } catch (err) {
      throw new Error(`Error fetching full synth data: ${err.message}`);
    }
  }

  // Returns more synths by the same manufacturer
  async getMoreSynths(limit = null) {
    try {
      const query = `
        SELECT
          synths.id AS synth_id,
          synths.synth_name,
          synths.image_url
        FROM synths
        LEFT JOIN synth_clicks ON synths.id = synth_clicks.synth_id
        WHERE synths.manufacturer = (
            SELECT manufacturer
            FROM synths
            WHERE synths.id = ?
        )
          AND synths.id != ?
        ORDER BY clicks DESC
        LIMIT ?`;

      return await DB.dbAll(query, [this.#id, this.#id, limit]);
    } catch (err) {
      throw new Error(`Error fetching more synths: ${err.message}`);
    }
  }

  // Returns instance as an object
  toJSON() {
    return {
      id: this.#id,
      synthName: this.#synthName,
      manufacturer: this.#manufacturer,
      synthType: this.#synthType,
      releaseYear: this.#releaseYear,
      imageUrl: this.#imageUrl,
      timestamp: this.#timestamp,
    };
  }

  // Getters
  get id() {
    return this.#id;
  }

  get synthName() {
    return this.#synthName;
  }

  get manufacturer() {
    return this.#manufacturer;
  }

  get synthType() {
    return this.#synthType;
  }

  get releaseYear() {
    return this.#releaseYear;
  }

  get imageUrl() {
    return this.#imageUrl;
  }

  get timestamp() {
    return this.#timestamp;
  }

  // Setters
  set synthName(synthName) {
    this.#synthName = synthName;
  }

  set manufacturer(manufacturer) {
    this.#manufacturer = manufacturer;
  }

  set synthType(synthType) {
    this.#synthType = synthType;
  }

  set releaseYear(releaseYear) {
    this.#releaseYear = releaseYear;
  }

  set imageUrl(imageUrl) {
    this.#imageUrl = imageUrl;
  }

  set timestamp(timestamp) {
    this.#timestamp = timestamp;
  }

  /* ----------------------------- Static Methods ----------------------------- */
  // Create, insert, and return a new Synth instance
  static async create({
    synthName,
    manufacturer,
    synthType,
    releaseYear,
    imageUrl,
  }) {
    try {
      const now = new Date().toISOString();
      const lastId = await DB.dbRun(
        `INSERT INTO synths (synth_name, manufacturer, synth_type, release_year, image_url, timestamp) VALUES (?, ?, ?, ?, ?, ?)`,
        [synthName, manufacturer, synthType, releaseYear, imageUrl, now]
      );

      return new Synth({
        id: lastId,
        synthName,
        manufacturer,
        synthType,
        releaseYear,
        imageUrl,
        timestamp: now,
      });
    } catch (err) {
      throw new Error(`Error creating Synth: ${err.message}`);
    }
  }

  // Returns new Synth instance from a DB row
  static #fromRow(row) {
    return new Synth({
      id: row.synth_id,
      synthName: row.synth_name,
      manufacturer: row.manufacturer,
      synthType: row.synth_type,
      releaseYear: row.synth_year,
      imageUrl: row.image_url,
      timestamp: row.timestamp,
    });
  }

  // Get synth by ID
  static async getById(id) {
    try {
      const row = await DB.dbGet(`SELECT * FROM synths WHERE id = ?`, [id]);
      return row ? Synth.#fromRow(row) : null;
    } catch (err) {
      throw new Error(`Error fetching Synth by ID: ${err.message}`);
    }
  }

  // Delete synth by ID
  static async deleteById(id) {
    try {
      await Promise.all([
        DB.dbRun(`DELETE FROM synths WHERE id = ?`, [id]),
        DB.dbRun(`DELETE FROM synth_clicks WHERE synth_id = ?`, [id]),
        DB.dbRun(`DELETE FROM preset_synths WHERE synth_id = ?`, [id]),
      ]);
    } catch (err) {
      throw new Error(`Error deleting synth by ID: ${err.message}`);
    }
  }

  // Return whether synth exists in DB by ID
  static async exists(id) {
    try {
      const synthId = await DB.dbGet(`SELECT id FROM synths WHERE id = ?`, [
        id,
      ]);
      return !!synthId;
    } catch (err) {
      throw new Error(`Error checking synth existence: ${err.message}`);
    }
  }

  // Get total number of synths in DB
  static async totalEntries() {
    try {
      const totalResults = await DB.dbGet(
        `SELECT COUNT(*) AS total_results FROM synths`
      );
      return totalResults ? totalResults.total_results : 0;
    } catch (err) {
      throw new Error(`Error fetching total entries: ${err.message}`);
    }
  }

  // Get all synths
  static async getAll(sort = null, direction = "ASC") {
    try {
      const query = `
        SELECT
          synths.synth_name AS synth_name,
          synths.id AS synth_id,
          synths.manufacturer AS synth_manufacturer,
          synths.release_year AS synth_release_year,
          synths.image_url AS synth_image,
          synths.synth_type AS synth_type,
          synths.timestamp AS synth_added_timestamp,
          COALESCE(synth_clicks.recent_click, 0) AS synth_recent_click
        FROM synths
        LEFT JOIN synth_clicks ON synth_clicks.synth_id = synths.id
        ORDER BY ${sort || "synths.timestamp"} ${direction}`;

      return await DB.dbAll(query);
    } catch (err) {
      throw new Error(`Error fetching all synths: ${err.message}`);
    }
  }
}

module.exports = Synth;
