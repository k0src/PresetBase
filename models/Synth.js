// Synth DB entry model for PresetBase
import DB from "./DB.js";
import Entry from "./Entry.js";

export default class Synth extends Entry {
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
    super();
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
        return DB.run(
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
        return DB.run(
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
          synths.id AS id,
          synths.synth_name AS name,
          synths.manufacturer,
          synths.synth_type AS type,
          synths.image_url AS imageUrl,
          synths.release_year AS year,
          synths.timestamp AS timestamp,

          json_group_array(
            DISTINCT json_object(
              'id', presets.id,
              'name', presets.preset_name,
              'packName', presets.pack_name,
              'author', presets.author,
              'synthId', synths.id,
              'imageUrl', synths.image_url
            )
          ) AS presets

        FROM synths
        LEFT JOIN preset_synths ON synths.id = preset_synths.synth_id
        LEFT JOIN presets ON preset_synths.preset_id = presets.id
        WHERE synths.id = ?
        GROUP BY synths.id`;

      const synthData = await DB.get(query, [this.#id]);

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
      let query = `
        SELECT
          synths.id AS id,
          synths.synth_name AS name,
          synths.image_url AS imageUrl
        FROM synths
        LEFT JOIN synth_clicks ON synths.id = synth_clicks.synth_id
        WHERE synths.manufacturer = (
            SELECT manufacturer
            FROM synths
            WHERE synths.id = ?
        )
          AND synths.id != ?
        ORDER BY clicks DESC`;

      const params = [this.#id, this.#id];
      if (limit) {
        query += ` LIMIT ?`;
        params.push(limit);
      }

      return await DB.all(query, params);
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
      const lastId = await DB.run(
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
      id: row.id,
      synthName: row.synth_name,
      manufacturer: row.manufacturer,
      synthType: row.synth_type,
      releaseYear: row.release_year,
      imageUrl: row.image_url,
      timestamp: row.timestamp,
    });
  }

  // Get synth by ID
  static async getById(id) {
    try {
      const row = await DB.get(`SELECT * FROM synths WHERE id = ?`, [id]);
      return row ? Synth.#fromRow(row) : null;
    } catch (err) {
      throw new Error(`Error fetching Synth by ID: ${err.message}`);
    }
  }

  // Delete synth by ID
  static async deleteById(id) {
    try {
      await Promise.all([
        DB.run(`DELETE FROM synths WHERE id = ?`, [id]),
        DB.run(`DELETE FROM synth_clicks WHERE synth_id = ?`, [id]),
        DB.run(`DELETE FROM preset_synths WHERE synth_id = ?`, [id]),
      ]);
    } catch (err) {
      throw new Error(`Error deleting synth by ID: ${err.message}`);
    }
  }

  // Return whether synth exists in DB by ID
  static async exists(id) {
    try {
      const synthId = await DB.get(`SELECT id FROM synths WHERE id = ?`, [id]);
      return !!synthId;
    } catch (err) {
      throw new Error(`Error checking synth existence: ${err.message}`);
    }
  }

  // Get total number of synths in DB
  static async totalEntries() {
    try {
      const totalResults = await DB.get(
        `SELECT COUNT(*) AS total_results FROM synths`
      );
      return totalResults ? totalResults.total_results : 0;
    } catch (err) {
      throw new Error(`Error fetching total entries: ${err.message}`);
    }
  }

  // Get all synths
  static async getAll(sort = "synths.timestamp", direction = "ASC") {
    try {
      // For case-insensitive sorting
      const textFields = [
        "synths.synth_name",
        "synths.manufacturer",
        "synths.synth_type",
      ];
      const sortClause = textFields.includes(sort)
        ? `${sort} COLLATE NOCASE ${direction}`
        : `${sort} ${direction}`;

      const query = `
        SELECT
          synths.synth_name AS name,
          synths.id AS id,
          synths.manufacturer AS manufacturer,
          synths.release_year AS year,
          synths.image_url AS imageUrl,
          synths.synth_type AS type,
          synths.timestamp AS timestamp
        FROM synths
        ORDER BY ${sortClause}`;

      return await DB.all(query);
    } catch (err) {
      throw new Error(`Error fetching all synths: ${err.message}`);
    }
  }

  // Get top synths by preset usage
  static async getTopSynths(limit = null) {
    try {
      const query = `
        SELECT
          synths.id AS id,
          synths.synth_name AS name,
          synths.manufacturer,
          synths.synth_type AS type,
          synths.image_url AS imageUrl,
          synths.release_year AS year,
          synths.timestamp AS timestamp,

          json_group_array(
            DISTINCT json_object(
              'id', presets.id,
              'name', presets.preset_name,
              'packName', presets.pack_name,
              'author', presets.author,
              'synthId', synths.id,
              'imageUrl', synths.image_url
            )
          ) AS presets,

        COALESCE(SUM(synth_clicks.clicks), 0) AS clicks

        FROM synths
        LEFT JOIN preset_synths ON synths.id = preset_synths.synth_id
        LEFT JOIN presets ON preset_synths.preset_id = presets.id
        LEFT JOIN synth_clicks ON synths.id = synth_clicks.synth_id
        GROUP BY synths.id
        ORDER BY clicks DESC
        ${limit ? "LIMIT ?" : ""}`;

      const params = [];
      if (limit) params.push(limit);

      const topSynthsData = await DB.all(query, params);

      if (topSynthsData) {
        topSynthsData.forEach((synth) => {
          synth.presets = JSON.parse(synth.presets || "[]");
        });
      }

      return topSynthsData;
    } catch (err) {
      throw new Error(`Error fetching top synths: ${err.message}`);
    }
  }

  // Get full synth data by ID
  static async getFullDataById(id) {
    try {
      const query = `
        SELECT
          synths.id AS id,
          synths.synth_name AS name,
          synths.manufacturer,
          synths.synth_type AS type,
          synths.image_url AS imageUrl,
          synths.release_year AS year,
          synths.timestamp AS timestamp,

          json_group_array(
            DISTINCT json_object(
              'id', presets.id,
              'name', presets.preset_name,
              'packName', presets.pack_name,
              'author', presets.author
            )
          ) AS presets

        FROM synths
        LEFT JOIN preset_synths ON synths.id = preset_synths.synth_id
        LEFT JOIN presets ON preset_synths.preset_id = presets.id
        WHERE synths.id = ?
        GROUP BY synths.id`;

      const synthData = await DB.get(query, [id]);

      if (synthData) {
        synthData.presets = JSON.parse(synthData.presets || "[]").filter(
          Boolean
        );
      }

      return synthData;
    } catch (err) {
      throw new Error(`Error fetching synth data: ${err.message}`);
    }
  }

  // Update synth by ID
  static async updateById(id, data, files) {
    try {
      await DB.beginTransaction();

      // Update main synth data
      const fields = [];
      const params = [];

      if (data.name) {
        fields.push("synth_name = ?");
        params.push(data.name);
      }

      if (data.manufacturer) {
        fields.push("manufacturer = ?");
        params.push(data.manufacturer);
      }

      if (data.type) {
        fields.push("synth_type = ?");
        params.push(data.type);
      }

      if (data.year) {
        fields.push("release_year = ?");
        params.push(data.year);
      }

      if (data.imageUrl) {
        fields.push("image_url = ?");
        params.push(data.imageUrl);
      }

      if (fields.length > 0) {
        params.push(id);
        await DB.run(
          `UPDATE synths SET ${fields.join(", ")} WHERE id = ?`,
          params
        );
      }

      // Relationships
      if ("presets" in data) {
        await DB.run(`DELETE FROM preset_synths WHERE synth_id = ?`, [id]);
        for (const preset of data.presets || []) {
          await DB.run(
            `INSERT INTO preset_synths (preset_id, synth_id) VALUES (?, ?)`,
            [preset.id, id]
          );
        }
      }

      await DB.commit();
    } catch (err) {
      await DB.rollback();
      throw new Error(`Error updating synth ${id}: ${err.message}`);
    }
  }

  static async searchForAutofill(query, limit = 10) {
    try {
      const sql = `
        SELECT id, synth_name as label
        FROM synths 
        WHERE synth_name LIKE ? 
        ORDER BY synth_name 
        LIMIT ?`;

      return await DB.all(sql, [`%${query}%`, limit]);
    } catch (err) {
      throw new Error(`Error searching synths for autofill: ${err.message}`);
    }
  }
}
