// Preset DB entry model for PresetBase
import DB from "./DB.js";
import Entry from "./Entry.js";

export default class Preset extends Entry {
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
        return DB.run(
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
        return DB.run(
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
          presets.id AS id,
          presets.preset_name AS name,
          presets.pack_name AS packName,
          presets.author AS author,
          presets.timestamp AS timestamp,

          json_object(
            'id', synths.id,
            'name', synths.synth_name,
            'manufacturer', synths.manufacturer,
            'type', synths.synth_type,
            'imageUrl', synths.image_url,
            'year', synths.release_year
          ) AS synth
        FROM presets
        LEFT JOIN preset_synths ON presets.id = preset_synths.preset_id
        LEFT JOIN synths ON preset_synths.synth_id = synths.id
        WHERE presets.id = ?`;

      const presetData = await DB.get(query, [this.#id]);

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
      const result = await DB.run(
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
      const row = await DB.get(`SELECT * FROM presets WHERE id = ?`, [id]);
      return row ? Preset.#fromRow(row) : null;
    } catch (err) {
      throw new Error(`Error fetching preset by ID: ${err.message}`);
    }
  }

  // Delete preset by ID
  static async deleteById(id) {
    try {
      await Promise.all([
        DB.run(`DELETE FROM presets WHERE id = ?`, [id]),
        DB.run(`DELETE FROM preset_synths WHERE preset_id = ?`, [id]),
        DB.run(`DELETE FROM song_presets WHERE preset_id = ?`, [id]),
      ]);
    } catch (err) {
      throw new Error(`Error deleting preset by ID: ${err.message}`);
    }
  }

  // Return whether preset in DB by ID
  static async exists(id) {
    try {
      const presetId = await DB.get(`SELECT id FROM presets WHERE id = ?`, [
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
      const totalResults = await DB.get(
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
          CASE
            WHEN synths.id IS NOT NULL THEN
              json_object(
                'id', synths.id,
                'name', synths.synth_name,
                'imageUrl', synths.image_url
              )
            ELSE NULL
          END AS synth
        FROM presets
        LEFT JOIN preset_synths ON presets.id = preset_synths.preset_id
        LEFT JOIN synths ON preset_synths.synth_id = synths.id
        GROUP BY presets.id
        ORDER BY ${sortClause}`;

      const presetsData = await DB.all(query);

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

  // Get top presets
  static async getTopPresets(limit = null) {
    try {
      const query = `
        SELECT
          presets.id AS id,
          presets.preset_name AS name,
          json_object(
            'id', synths.id,
            'name', synths.synth_name,
            'imageUrl', synths.image_url
          ) AS synth,
          preset_usage_stats.most_common_usage_type AS usageType,
          preset_usage_stats.total_usage_count AS usageCount
        FROM presets
        LEFT JOIN preset_synths ON presets.id = preset_synths.preset_id
        LEFT JOIN synths ON preset_synths.synth_id = synths.id
        LEFT JOIN (
          SELECT 
            song_presets.preset_id,
            COUNT(*) AS total_usage_count,
            (
              SELECT sp_inner.usage_type
              FROM song_presets sp_inner
              WHERE sp_inner.preset_id = song_presets.preset_id
              GROUP BY sp_inner.usage_type
              ORDER BY COUNT(*) DESC
              LIMIT 1
            ) AS most_common_usage_type
          FROM song_presets
          GROUP BY song_presets.preset_id
        ) AS preset_usage_stats ON presets.id = preset_usage_stats.preset_id
        WHERE preset_usage_stats.total_usage_count IS NOT NULL
        ORDER BY preset_usage_stats.total_usage_count DESC
        ${limit ? "LIMIT ?" : ""}`;

      const params = [];
      if (limit) params.push(limit);

      const topPresetsData = await DB.all(query, params);

      if (topPresetsData) {
        topPresetsData.forEach((preset) => {
          preset.synth = JSON.parse(preset.synth || "{}");
        });
      }

      return topPresetsData;
    } catch (err) {
      throw new Error(`Error fetching top presets: ${err.message}`);
    }
  }

  // Get full preset data by ID
  static async getFullDataById(id) {
    try {
      const query = `
        SELECT
          presets.id AS id,
          presets.preset_name AS name,
          presets.pack_name AS packName,
          presets.author AS author,
          presets.timestamp AS timestamp,
          json_object(
            'id', synths.id,
            'name', synths.synth_name,
            'manufacturer', synths.manufacturer,
            'type', synths.synth_type,
            'imageUrl', synths.image_url,
            'year', synths.release_year
          ) AS synth
        FROM presets
        LEFT JOIN preset_synths ON presets.id = preset_synths.preset_id
        LEFT JOIN synths ON preset_synths.synth_id = synths.id
        WHERE presets.id = ?`;

      const presetData = await DB.get(query, [id]);

      if (presetData) {
        presetData.synth = JSON.parse(presetData.synth || "{}");
      }

      return presetData;
    } catch (err) {
      throw new Error(`Error fetching preset data: ${err.message}`);
    }
  }

  // Update preset by ID
  static async updateById(id, data, files) {
    try {
      await DB.beginTransaction();

      // Update main preset data
      const fields = [];
      const params = [];

      if (data.name) {
        fields.push("preset_name = ?");
        params.push(data.name);
      }

      if (data.packName) {
        fields.push("pack_name = ?");
        params.push(data.packName);
      }

      if (data.author) {
        fields.push("author = ?");
        params.push(data.author);
      }

      if (fields.length > 0) {
        params.push(id);
        await DB.run(
          `UPDATE presets SET ${fields.join(", ")} WHERE id = ?`,
          params
        );
      }

      // Update relationships
      if ("synth" in data) {
        await DB.run("DELETE FROM preset_synths WHERE preset_id = ?", [id]);
        if (data.synth) {
          await DB.run(
            `INSERT INTO preset_synths (preset_id, synth_id) VALUES (?, ?)`,
            [id, data.synth]
          );
        }
      }

      await DB.commit();
    } catch (err) {
      await DB.rollback();
      throw new Error(`Error updating preset ${id}: ${err.message}`);
    }
  }

  static async searchForAutofill(query, limit = 10) {
    try {
      const sql = `
        SELECT id, preset_name as label
        FROM presets 
        WHERE preset_name LIKE ? 
        ORDER BY preset_name 
        LIMIT ?`;

      return await DB.all(sql, [`%${query}%`, limit]);
    } catch (err) {
      throw new Error(`Error searching presets for autofill: ${err.message}`);
    }
  }
}
