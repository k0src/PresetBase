// Genre (tag) DB entry model for PresetBase
const DB = require("./DB.js");
const Entry = require("./Entry.js");

class Genre extends Entry {
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
        return DB.dbRun(
          `UPDATE genres SET name = ?, slug = ?, text_color = ?, border_color = ?, background_color = ? WHERE id = ?`,
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
        return DB.dbRun(
          `INSERT INTO genres (name, slug, text_color, border_color, background_color) VALUES (?, ?, ?, ?, ?)`,
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
          genres.id AS genre_id,
          genres.name AS genre_name,
          genres.slug AS genre_slug,
          genres.text_color AS genre_text_color,
          genres.border_color AS genre_border_color,
          genres.background_color AS genre_background_color,
          s.image_url AS song_image,
          COUNT(s.id) AS num_songs
        FROM genres
        LEFT JOIN songs ON songs.genre = genres.name
        WHERE genres.id = ?
        GROUP BY genres.id, genres.name, genres.slug, genres.text_color, 
                 genres.border_color, genres.background_color, s.image_url`;

      return await DB.dbGet(query, [this.#id]);
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

      const lastId = await DB.dbRun(
        `INSERT INTO genres (name, slug, text_color, border_color, background_color) 
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
      backgroundColor: row.background_color,
    });
  }

  // Get genre by ID
  static async getById(id) {
    try {
      const row = await DB.dbGet(`SELECT * FROM genres WHERE id = ?`, [id]);
      return row ? Genre.#fromRow(row) : null;
    } catch (err) {
      throw new Error(`Error fetching genre by ID: ${err.message}`);
    }
  }

  // Delete genre by ID
  static async deleteById(id) {
    try {
      await DB.dbRun(`DELETE FROM genres WHERE id = ?`, [id]);
    } catch (err) {
      throw new Error(`Error deleting genre by ID: ${err.message}`);
    }
  }

  // Return whether genre exists in DB by ID
  static async exists(id) {
    try {
      const genreId = await DB.dbGet(`SELECT id FROM genres WHERE id = ?`, [
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
      const totalResults = await DB.dbGet(
        `SELECT COUNT(*) AS total_results FROM genres`
      );
      return totalResults ? totalResults.total_results : 0;
    } catch (err) {
      throw new Error(`Error fetching total entries: ${err.message}`);
    }
  }

  // Get all genres
  static async getAll(sort = null, direction = "ASC") {
    try {
      const query = `
        SELECT
          genres.id AS genre_id,
          genres.name AS genre_name,
          genres.slug AS genre_slug,
          genres.text_color AS genre_text_color,
          genres.border_color AS genre_border_color,
          genres.background_color AS genre_background_color,
          COUNT(songs.id) AS num_songs,
          MAX(songs.image_url) AS song_image
        FROM genres
        LEFT JOIN songs ON songs.genre = genres.name
        GROUP BY genres.id, genres.name, genres.slug, genres.text_color, genres.border_color, genres.background_color
        ORDER BY ${sort || "genres.id"} ${direction}`;

      return await DB.dbAll(query);
    } catch (err) {
      throw new Error(`Error fetching all genres: ${err.message}`);
    }
  }
}

module.exports = Genre;
