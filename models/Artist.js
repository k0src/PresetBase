// Artist DB entry model for PresetBase
const DB = require("./DB.js");
const Entry = require("./Entry.js");

class Artist extends Entry {
  #id;
  #name;
  #country;
  #imageUrl;
  #timestamp;

  constructor({ id = null, name, country, imageUrl, timestamp }) {
    this.#id = id;
    this.#name = name;
    this.#country = country;
    this.#imageUrl = imageUrl;
    this.#timestamp = timestamp;
  }

  // Save/Update artist in the DB
  async save() {
    try {
      if (this.#id) {
        return DB.dbRun(
          `UPDATE artists SET name = ?, country = ?, image_url = ?, timestamp = ? WHERE id = ?`,
          [this.#name, this.#country, this.#imageUrl, this.#timestamp, this.#id]
        );
      } else {
        return DB.dbRun(
          `INSERT INTO artists (name, country, image_url, timestamp) VALUES (?, ?, ?, ?)`,
          [this.#name, this.#country, this.#imageUrl, this.#timestamp]
        );
      }
    } catch (err) {
      throw new Error(`Error saving artist: ${err.message}`);
    }
  }

  // Get full artist data, including songs
  async getFullData() {
    try {
      const query = `
        SELECT
          artists.id AS artist_id,
          artists.name AS artist_name,
          artists.image_url,
          artists.country AS artist_country,
          artists.timestamp AS artist_added_timestamp,
          json_group_array(
            DISTINCT json_object(
              'id', songs.id,
              'title', songs.title,
              'image_url', songs.image_url,
              'song_genre', songs.genre,
              'song_year', songs.release_year,
              'album_title', albums.title
            )
          ) AS songs
        FROM artists
        LEFT JOIN song_artists ON artists.id = song_artists.artist_id
        LEFT JOIN songs ON song_artists.song_id = songs.id
        LEFT JOIN album_songs ON songs.id = album_songs.song_id
        LEFT JOIN albums ON album_songs.album_id = albums.id
        WHERE artists.id = ?
        GROUP BY artists.id`;

      const artistData = await DB.dbGet(query, [this.#id]);

      if (artistData) {
        artistData.songs = JSON.parse(artistData.songs || "[]");
      }

      return artistData;
    } catch (err) {
      throw new Error(`Error fetching artist data: ${err.message}`);
    }
  }

  // Get albums by artist
  async getAlbums() {
    try {
      const query = `
        SELECT
          albums.id AS album_id,
          albums.title AS album_title,
          albums.image_url,
          albums.genre AS album_genre,
          albums.release_year AS album_year
        FROM albums
        LEFT JOIN album_songs ON albums.id = album_songs.album_id
        LEFT JOIN song_artists ON album_songs.song_id = song_artists.song_id
        WHERE song_artists.artist_id = ? 
          AND albums.title IS NOT '[SINGLE]' 
          AND song_artists.role = 'Main'
        GROUP BY albums.id`;

      return await DB.dbAll(query, [this.#id]);
    } catch (err) {
      throw new Error(`Error fetching artist albums: ${err.message}`);
    }
  }

  // Get total number of songs by artist
  async getTotalSongs() {
    try {
      const query = `
        SELECT COUNT(*) AS total_songs
          FROM songs
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        WHERE song_artists.artist_id = ?`;

      const totalSongs = await DB.dbGet(query, [this.#id]);
      return totalSongs.total_songs;
    } catch (err) {
      throw new Error(`Error fetching total songs: ${err.message}`);
    }
  }

  // Get artist's favorite synth
  async getFavoriteSynth() {
    try {
      const query = `
        SELECT
          synths.id AS synth_id,
          synths.synth_name,
          COUNT(*) AS usage_count
        FROM artists
        JOIN song_artists ON artists.id = song_artists.artist_id
        JOIN songs ON song_artists.song_id = songs.id
        JOIN song_presets ON songs.id = song_presets.song_id
        JOIN presets ON song_presets.preset_id = presets.id
        JOIN preset_synths ON presets.id = preset_synths.preset_id
        JOIN synths ON preset_synths.synth_id = synths.id
        WHERE artists.id = ?
        GROUP BY synths.id, synths.synth_name
        ORDER BY usage_count DESC
        LIMIT 1`;

      return await DB.dbGet(query, [this.#id]);
    } catch (err) {
      throw new Error(`Error fetching favorite synth: ${err.message}`);
    }
  }

  // Return instance as an object
  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      country: this.#country,
      imageUrl: this.#imageUrl,
      timestamp: this.#timestamp,
    };
  }

  // Getters
  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get country() {
    return this.#country;
  }

  get imageUrl() {
    return this.#imageUrl;
  }

  get timestamp() {
    return this.#timestamp;
  }

  // Setters
  set name(name) {
    this.#name = name;
  }

  set country(country) {
    this.#country = country;
  }

  set imageUrl(imageUrl) {
    this.#imageUrl = imageUrl;
  }

  set timestamp(timestamp) {
    this.#timestamp = timestamp;
  }

  /* ----------------------------- Static Methods ----------------------------- */
  // Create, insert, and return a new Artist instance
  static async create({ name, country, imageUrl }) {
    try {
      const now = new Date().toISOString();
      const lastId = await DB.dbRun(
        `INSERT INTO artists (name, country, image_url, timestamp) VALUES (?, ?, ?, ?)`,
        [name, country, imageUrl, now]
      );

      return new Artist({
        id: lastId,
        name,
        country,
        imageUrl,
        timestamp: now,
      });
    } catch (err) {
      throw new Error(`Error creating Artist: ${err.message}`);
    }
  }

  // Returns new Artist instance from a DB row
  static #fromRow(row) {
    return new Artist({
      id: row.id,
      name: row.name,
      country: row.country,
      imageUrl: row.image_url,
      timestamp: row.timestamp,
    });
  }

  // Get artist by ID
  static async getById(id) {
    try {
      const row = await DB.dbGet(`SELECT * FROM artists WHERE id = ?`, [id]);
      return row ? Artist.#fromRow(row) : null;
    } catch (err) {
      throw new Error(`Error fetching artist by ID: ${err.message}`);
    }
  }

  // Deletertist by ID
  static async deleteById(id) {
    try {
      await Promise.all([
        DB.dbRun(`DELETE FROM artists WHERE id = ?`, [id]),
        DB.dbRun(`DELETE FROM song_artists WHERE artist_id = ?`, [id]),
        DB.dbRun(`DELETE FROM artist_clicks WHERE artist_id = ?`, [id]),
      ]);
    } catch (err) {
      throw new Error(`Error deleting artist by ID: ${err.message}`);
    }
  }

  // Return whether artist exists in DB by ID
  static async exists(id) {
    try {
      const artistId = await DB.dbGet(`SELECT id FROM artists WHERE id = ?`, [
        id,
      ]);
      return !!artistId;
    } catch (err) {
      throw new Error(`Error checking artist existence: ${err.message}`);
    }
  }

  // Get total number of artists in DB
  static async totalEntries() {
    try {
      const totalResults = await DB.dbGet(
        `SELECT COUNT(*) AS total_results FROM artists`
      );
      return totalResults ? totalResults.total_results : 0;
    } catch (err) {
      throw new Error(`Error fetching total entries: ${err.message}`);
    }
  }

  // Get all artists
  static async getAll(sort = null, direction = "ASC") {
    try {
      const query = `
        SELECT
          artists.name AS artist_name,
          artists.id AS artist_id,
          artists.country AS artist_country,
          artists.image_url AS artist_image,
          artists.timestamp AS artist_added_timestamp,
          COALESCE(artist_clicks.recent_click, 0) AS artist_recent_click
        FROM artists
        LEFT JOIN artist_clicks ON artist_clicks.artist_id = artists.id
        ORDER BY ${sort || "artists.timestamp"} ${direction}`;

      return await DB.dbAll(query);
    } catch (err) {
      throw new Error(`Error fetching all artists: ${err.message}`);
    }
  }
}

module.exports = Artist;
