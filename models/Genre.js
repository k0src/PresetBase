// Genre (tag) DB entry model for PresetBase
import DB from "./DB.js";
import Entry from "./Entry.js";

export default class Genre extends Entry {
  #id;
  #name;
  #slug;
  #textColor;
  #borderColor;
  #backgroundColor;

  constructor({
    id = null,
    name,
    slug,
    textColor,
    borderColor,
    backgroundColor,
  }) {
    this.#id = id;
    this.#name = name;
    this.#slug = slug;
    this.#textColor = textColor;
    this.#borderColor = borderColor;
    this.#backgroundColor = backgroundColor;
  }

  // Save/Update genre in the DB
  async save() {
    try {
      if (this.#id) {
        return DB.run(
          `UPDATE genre_tags SET name = ?, slug = ?, text_color = ?, border_color = ?, bg_color = ? WHERE id = ?`,
          [
            this.#name,
            this.#slug,
            this.#textColor,
            this.#borderColor,
            this.#backgroundColor,
            this.#id,
          ]
        );
      } else {
        return DB.run(
          `INSERT INTO genre_tags (name, slug, text_color, border_color, bg_color) VALUES (?, ?, ?, ?, ?)`,
          [
            this.#name,
            this.#slug,
            this.#textColor,
            this.#borderColor,
            this.#backgroundColor,
          ]
        );
      }
    } catch (err) {
      throw new Error(`Error saving genre: ${err.message}`);
    }
  }

  // Get full genre data, including number of songs, and a random song image to represent it
  async getFullData() {
    try {
      const query = `
        SELECT
          genre_tags.id AS id,
          genre_tags.name AS name,
          genre_tags.slug AS slug,
          genre_tags.text_color AS textColor,
          genre_tags.border_color AS borderColor,
          genre_tags.bg_color AS backgroundColor,
          genre_tags.timestamp AS timestamp,
          songs.image_url AS imageUrl,
          COUNT(songs.id) AS songCount
        FROM genre_tags
        LEFT JOIN songs ON songs.genre = genre_tags.name
        WHERE genre_tags.id = ?
        GROUP BY genre_tags.id, genre_tags.name, genre_tags.slug, genre_tags.text_color, 
          genre_tags.border_color, genre_tags.bg_color, songs.image_url`;

      return await DB.get(query, [this.#id]);
    } catch (err) {
      throw new Error(`Error fetching genre data: ${err.message}`);
    }
  }

  // Returns instance as object
  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      slug: this.#slug,
      textColor: this.#textColor,
      borderColor: this.#borderColor,
      backgroundColor: this.#backgroundColor,
    };
  }

  // Getters
  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get slug() {
    return this.#slug;
  }

  get textColor() {
    return this.#textColor;
  }

  get borderColor() {
    return this.#borderColor;
  }

  get backgroundColor() {
    return this.#backgroundColor;
  }

  // Setters
  // add decorators here later in TS to validate
  set name(name) {
    this.#name = name;
  }

  set slug(slug) {
    this.#slug = slug;
  }

  set textColor(textColor) {
    this.#textColor = textColor;
  }

  set borderColor(borderColor) {
    this.#borderColor = borderColor;
  }

  set backgroundColor(backgroundColor) {
    this.#backgroundColor = backgroundColor;
  }

  /* ----------------------------- Static Methods ----------------------------- */
  static #generateTagColors() {
    const hslToHex = function (h, s, l) {
      l /= 100;
      const a = (s * Math.min(l, 1 - l)) / 100;
      const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
          .toString(16)
          .padStart(2, "0");
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    };

    // Color family definitions
    const colorFamilies = [
      { hueMin: 300, hueMax: 340 }, // Pink/Magenta
      { hueMin: 0, hueMax: 20 }, // Red
      { hueMin: 20, hueMax: 45 }, // Orange
      { hueMin: 45, hueMax: 70 }, // Yellow
      { hueMin: 120, hueMax: 160 }, // Green
      { hueMin: 180, hueMax: 200 }, // Cyan
      { hueMin: 200, hueMax: 260 }, // Blue
      { hueMin: 260, hueMax: 300 }, // Purple
    ];

    const family =
      colorFamilies[Math.floor(Math.random() * colorFamilies.length)];
    const hue =
      Math.floor(Math.random() * (family.hueMax - family.hueMin + 1)) +
      family.hueMin;

    // Generate colors
    const textColor = hslToHex(
      hue,
      85 + Math.floor(Math.random() * 15),
      75 + Math.floor(Math.random() * 15)
    );
    const borderColor = hslToHex(
      hue,
      50 + Math.floor(Math.random() * 20),
      25 + Math.floor(Math.random() * 10)
    );
    const backgroundColor = hslToHex(
      hue,
      35 + Math.floor(Math.random() * 15),
      12 + Math.floor(Math.random() * 8)
    );

    return {
      textColor,
      borderColor,
      backgroundColor,
    };
  }
  // Create, insert, and return a new Genre
  // If colors are not specfied, random ones are generated.
  static async create({
    name,
    slug,
    textColor = null,
    borderColor = null,
    backgroundColor = null,
  }) {
    try {
      if (!textColor && !borderColor && !backgroundColor) {
        const colors = Genre.#generateTagColors();
        textColor = colors.textColor;
        borderColor = colors.borderColor;
        backgroundColor = colors.backgroundColor;
      }

      const lastId = await DB.run(
        `INSERT INTO genre_tags (name, slug, text_color, border_color, bg_color) 
         VALUES (?, ?, ?, ?, ?)`,
        [name, slug, textColor, borderColor, backgroundColor]
      );

      return new Genre({
        id: lastId,
        name,
        slug,
        textColor,
        borderColor,
        backgroundColor,
      });
    } catch (err) {
      throw new Error(`Error creating Genre: ${err.message}`);
    }
  }

  // Returns new Genre instance from a database row
  static #fromRow(row) {
    return new Genre({
      id: row.id,
      name: row.name,
      slug: row.slug,
      textColor: row.text_color,
      borderColor: row.border_color,
      backgroundColor: row.bg_color,
    });
  }

  // Get genre by ID
  static async getById(id) {
    try {
      const row = await DB.get(`SELECT * FROM genre_tags WHERE id = ?`, [id]);
      return row ? Genre.#fromRow(row) : null;
    } catch (err) {
      throw new Error(`Error fetching genre by ID: ${err.message}`);
    }
  }

  // Delete genre by ID
  static async deleteById(id) {
    try {
      await DB.run(`DELETE FROM genre_tags WHERE id = ?`, [id]);
    } catch (err) {
      throw new Error(`Error deleting genre by ID: ${err.message}`);
    }
  }

  // Return whether genre exists in DB by ID
  static async exists(id) {
    try {
      const genreId = await DB.get(`SELECT id FROM genre_tags WHERE id = ?`, [
        id,
      ]);
      return !!genreId;
    } catch (err) {
      throw new Error(`Error checking genre existence: ${err.message}`);
    }
  }

  // Get total number of genre in DB
  static async totalEntries() {
    try {
      const totalResults = await DB.get(
        `SELECT COUNT(*) AS total_results FROM genre_tags`
      );
      return totalResults ? totalResults.total_results : 0;
    } catch (err) {
      throw new Error(`Error fetching total entries: ${err.message}`);
    }
  }

  // Get full genre data by ID
  static async getFullDataById(id) {
    try {
      const query = `
        SELECT
          id, 
          name,
          slug,
          text_color AS textColor,
          bg_color AS backgroundColor,
          border_color AS borderColor,
          timestamp
        FROM genre_tags
        WHERE id = ?`;

      return await DB.get(query, [id]);
    } catch (err) {
      throw new Error(`Error fetching full genre data: ${err.message}`);
    }
  }

  // Update genre by ID
  static async updateById(id, data) {
    try {
      await DB.beginTransaction();

      // Update main genre data
      const fields = [];
      const params = [];

      if (data.name) {
        fields.push("name = ?");
        params.push(data.name);
      }

      if (data.slug) {
        fields.push("slug = ?");
        params.push(data.slug);
      }

      if (data.textColor) {
        fields.push("text_color = ?");
        params.push(data.textColor);
      }

      if (data.backgroundColor) {
        fields.push("bg_color = ?");
        params.push(data.backgroundColor);
      }

      if (data.borderColor) {
        fields.push("border_color = ?");
        params.push(data.borderColor);
      }

      if (fields.length > 0) {
        params.push(id);
        await DB.run(
          `UPDATE genre_tags SET ${fields.join(", ")} WHERE id = ?`,
          params
        );
      }

      await DB.commit();
    } catch (err) {
      await DB.rollback();
      throw new Error(`Error updating genre ${id}: ${err.message}`);
    }
  }

  // Search genres for autofill dropdown
  static async searchForAutofill(query, limit = 10) {
    try {
      const sql = `
        SELECT id, name as label
        FROM genre_tags 
        WHERE name LIKE ? 
        ORDER BY name 
        LIMIT ?`;

      return await DB.all(sql, [`%${query}%`, limit]);
    } catch (err) {
      throw new Error(`Error searching genres for autofill: ${err.message}`);
    }
  }

  // Get all genres
  static async getAll(sort = "genre_tags.timestamp", direction = "ASC") {
    try {
      // For case-insensitive sorting on text fields
      const textFields = ["genre_tags.name"];

      let sortClause;
      if (sort === "songCount") {
        sortClause = `COUNT(songs.id) ${direction}`;
      } else if (textFields.includes(sort)) {
        sortClause = `${sort} COLLATE NOCASE ${direction}`;
      } else {
        sortClause = `${sort} ${direction}`;
      }

      const query = `
        SELECT
          genre_tags.id AS id,
          genre_tags.name AS name,
          genre_tags.slug AS slug,
          genre_tags.text_color AS textColor,
          genre_tags.border_color AS borderColor,
          genre_tags.bg_color AS backgroundColor,
          genre_tags.timestamp AS timestamp,
          COUNT(songs.id) AS songCount,
          MAX(songs.image_url) AS imageUrl
        FROM genre_tags
        LEFT JOIN songs ON songs.genre = genre_tags.name
        GROUP BY genre_tags.id
        ORDER BY ${sortClause}`;

      return await DB.all(query);
    } catch (err) {
      throw new Error(`Error fetching all genres: ${err.message}`);
    }
  }

  // Get top genres
  static async getTopGenres(limit = null) {
    try {
      const query = `
        SELECT
          genre_tags.id AS id,
          genre_tags.name AS name,
          genre_tags.slug AS slug,
          genre_tags.text_color AS textColor,
          genre_tags.border_color AS borderColor,
          genre_tags.bg_color AS backgroundColor,
          genre_tags.timestamp AS timestamp,
          COUNT(songs.id) AS songCount,
          MAX(songs.image_url) AS imageUrl
        FROM genre_tags
        LEFT JOIN songs ON songs.genre = genre_tags.name
        GROUP BY genre_tags.id, genre_tags.name, genre_tags.slug, 
          genre_tags.text_color, genre_tags.border_color, genre_tags.bg_color
        HAVING songCount > 0
        ORDER BY songCount DESC
        ${limit ? "LIMIT ?" : ""}`;

      const params = [];
      if (limit) params.push(limit);

      return await DB.all(query, params);
    } catch (err) {
      throw new Error(`Error fetching top genres: ${err.message}`);
    }
  }
}
