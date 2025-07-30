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

  // Return full song data, including album, artists, and presets
  async getFullData() {
    try {
      const query = `
        SELECT
          songs.id AS song_id,
          songs.title AS song_title,
          songs.song_url,
          songs.image_url,
          songs.genre AS song_genre,
          songs.release_year AS song_year,
          json_object('id', albums.id, 'title', albums.title) AS album,

          json_group_array(
            DISTINCT json_object(
              'id', artists.id,
              'name', artists.name,
              'role', song_artists.role
            )
          ) AS artists,

          json_group_array(
            DISTINCT json_object(
              'preset_id', presets.id,
              'name', presets.preset_name,
              'usage_type', song_presets.usage_type,
              'audio_url', song_presets.audio_url,
              'synth_id', synths.id,
              'synth_name', synths.synth_name,
              'synth_image', synths.image_url
            )
          ) AS presets

        FROM songs
        LEFT JOIN album_songs ON songs.id = album_songs.song_id
        LEFT JOIN albums ON album_songs.album_id = albums.id
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        LEFT JOIN song_presets ON songs.id = song_presets.song_id
        LEFT JOIN presets ON song_presets.preset_id = presets.id
        LEFT JOIN preset_synths ON presets.id = preset_synths.preset_id
        LEFT JOIN synths ON preset_synths.synth_id = synths.id
        WHERE songs.id = ?
        GROUP BY songs.id`;

      const songData = await dbGet(query, [this.#id]);

      if (songData) {
        songData.album = JSON.parse(songData.album || "{}");
        songData.artists = JSON.parse(songData.artists || "[]");
        songData.presets = JSON.parse(songData.presets || "[]");
      }

      return songData;
    } catch (err) {
      throw new Error(`Error fetching full song data: ${err.message}`);
    }
  }

  // Returns more songs by the same artist, ordered by clicks
  async getMoreSongs(limit = null) {
    try {
      const query = `
        SELECT
          songs.id AS song_id,
          songs.title AS song_title,
          songs.image_url
        FROM songs
        JOIN song_artists ON songs.id = song_artists.song_id
        JOIN (
          SELECT song_artists.artist_id
          FROM song_artists
          WHERE song_artists.song_id = ?
            AND song_artists.role = 'Main'
        ) AS main_artist ON song_artists.artist_id = main_artist.artist_id
        LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
        WHERE songs.id != ?
        GROUP BY songs.id
        ORDER BY COALESCE(song_clicks.clicks, 0) DESC
        LIMIT ?`;

      return await dbAll(query, [this.#id, this.#id, limit]);
    } catch (err) {
      throw new Error(`Error fetching more songs: ${err.message}`);
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

module.exports = Song;
