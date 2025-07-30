// Song DB entry model for PresetBase
const { dbGet, dbRun, dbAll } = require("./UTIL");

class Song {
  #id;
  #title;
  #genre;
  #releaseYear;
  #songUrl;
  #imageUrl;
  #timestamp;

  constructor({ id = null, title, genre, releaseYear, songUrl, imageUrl }) {
    this.#id = id;
    this.#title = title;
    this.#genre = genre;
    this.#releaseYear = releaseYear;
    this.#songUrl = songUrl;
    this.#imageUrl = imageUrl;
    this.#timestamp = new Date().toISOString();
  }

  // Save/Update the song in the database
  async save() {
    try {
      if (this.#id) {
        return dbRun(
          `UPDATE songs SET title = ?, genre = ?, release_year = ?, song_url = ?, image_url = ? WHERE id = ?`,
          [
            this.#title,
            this.#genre,
            this.#releaseYear,
            this.#songUrl,
            this.#imageUrl,
            this.#id,
          ]
        );
      } else {
        return dbRun(
          `INSERT INTO songs (title, genre, release_year, song_url, image_url) VALUES (?, ?, ?, ?, ?)`,
          [
            this.#title,
            this.#genre,
            this.#releaseYear,
            this.#songUrl,
            this.#imageUrl,
          ]
        );
      }
    } catch (err) {
      throw new Error(`Error saving song: ${err.message}`);
    }
  }

  // Returns instance as an object
  async toJSON() {
    return {
      id: this.#id,
      title: this.#title,
      genre: this.#genre,
      releaseYear: this.#releaseYear,
      songUrl: this.#songUrl,
      imageUrl: this.#imageUrl,
      timestamp: this.#timestamp,
    };
  }

  // Getters
  get id() {
    return this.#id;
  }

  get title() {
    return this.#title;
  }

  get genre() {
    return this.#genre;
  }

  get releaseYear() {
    return this.#releaseYear;
  }

  get songUrl() {
    return this.#songUrl;
  }

  get imageUrl() {
    return this.#imageUrl;
  }

  get timestamp() {
    return this.#timestamp;
  }

  // Setters
  // Add decorators here when switching to TS - Sanitize("string", "email", "file", "url", etc)
  set title(title) {
    this.#title = title;
  }

  set genre(genre) {
    this.#genre = genre;
  }

  set releaseYear(releaseYear) {
    this.#releaseYear = releaseYear;
  }

  set songUrl(songUrl) {
    this.#songUrl = songUrl;
  }

  set imageUrl(imageUrl) {
    this.#imageUrl = imageUrl;
  }

  set timestamp(timestamp) {
    this.#timestamp = timestamp;
  }

  /* ----------------------------- Static Methods ----------------------------- */
  // Create, insert, and return a new Song instance
  static async create({ title, genre, releaseYear, songUrl, imageUrl }) {
    try {
      const now = new Date().toISOString();
      const lastId = await dbRun(
        `INSERT INTO songs (title, genre, release_year, song_url, image_url, timestamp)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, genre, releaseYear, songUrl, imageUrl, now]
      );
      return new Song({
        id: lastId,
        title,
        genre,
        releaseYear,
        songUrl,
        imageUrl,
      });
    } catch (err) {
      throw new Error(`Error creating Song: ${err.message}`);
    }
  }

  // Returns new Song instance from a database row
  static #fromRow(row) {
    return new Song({
      id: row.id,
      title: row.title,
      genre: row.genre,
      releaseYear: row.release_year,
      songUrl: row.song_url,
      imageUrl: row.image_url,
    });
  }

  // Get song by ID
  static async getById(id) {
    try {
      const row = await dbGet(`SELECT * FROM songs WHERE id = ?`, [id]);
      return row ? Song.#fromRow(row) : null;
    } catch (err) {
      throw new Error(`Error fetching song by ID: ${err.message}`);
    }
  }

  // Delete song by ID
  static async deleteById(id) {
    try {
      await Promise.all([
        dbRun(`DELETE FROM song_artists WHERE song_id = ?`, [id]),
        dbRun(`DELETE FROM song_presets WHERE song_id = ?`, [id]),
        dbRun(`DELETE FROM song_clicks WHERE song_id = ?`, [id]),
        dbRun(`DELETE FROM album_songs WHERE song_id = ?`, [id]),
        dbRun(`DELETE FROM songs WHERE id = ?`, [id]),
      ]);
    } catch (err) {
      throw new Error(`Error deleting song by ID: ${err.message}`);
    }
  }

  // Return whether song exists in DB by ID
  static async exists(id) {
    try {
      const songId = await dbGet(`SELECT id FROM songs WHERE id = ?`, [id]);
      return !!songId;
    } catch (err) {
      throw new Error(`Error checking if song exists: ${err.message}`);
    }
  }
}
