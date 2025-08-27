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
    super();
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
        return DB.run(
          `UPDATE artists SET name = ?, country = ?, image_url = ?, timestamp = ? WHERE id = ?`,
          [this.#name, this.#country, this.#imageUrl, this.#timestamp, this.#id]
        );
      } else {
        return DB.run(
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
          artists.id AS id,
          artists.name AS name,
          artists.image_url AS imageUrl,
          artists.country AS country,
          artists.timestamp AS timestamp,
          json_group_array(
            DISTINCT json_object(
              'id', songs.id,
              'title', songs.title,
              'imageUrl', songs.image_url,
              'genre', songs.genre,
              'year', songs.release_year,
              'album', albums.title
            )
          ) AS songs
        FROM artists
        LEFT JOIN song_artists ON artists.id = song_artists.artist_id
        LEFT JOIN songs ON song_artists.song_id = songs.id
        LEFT JOIN album_songs ON songs.id = album_songs.song_id
        LEFT JOIN albums ON album_songs.album_id = albums.id
        WHERE artists.id = ?
        GROUP BY artists.id`;

      const artistData = await DB.get(query, [this.#id]);

      if (artistData) {
        artistData.songs = JSON.parse(artistData.songs || "[]");
      }

      return artistData;
    } catch (err) {
      throw new Error(`Error fetching artist data: ${err.message}`);
    }
  }

  // Get albums by artist
  async getAlbums(limit = null) {
    try {
      let query = `
        SELECT
          albums.id AS id,
          albums.title AS title,
          albums.image_url AS imageUrl,
          albums.genre AS genre,
          albums.release_year AS year
        FROM albums
        LEFT JOIN album_songs ON albums.id = album_songs.album_id
        LEFT JOIN song_artists ON album_songs.song_id = song_artists.song_id
        WHERE song_artists.artist_id = ? 
          AND albums.title IS NOT '[SINGLE]' 
          AND song_artists.role = 'Main'
        GROUP BY albums.id`;

      let params = [this.#id];
      if (typeof limit === "number" && limit > 0) {
        query += ` LIMIT ?`;
        params.push(limit);
      }

      return await DB.all(query, params);
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

      const totalSongs = await DB.get(query, [this.#id]);
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
          synths.id AS id,
          synths.synth_name AS name,
          COUNT(*) AS usageCount
        FROM artists
        JOIN song_artists ON artists.id = song_artists.artist_id
        JOIN songs ON song_artists.song_id = songs.id
        JOIN song_presets ON songs.id = song_presets.song_id
        JOIN presets ON song_presets.preset_id = presets.id
        JOIN preset_synths ON presets.id = preset_synths.preset_id
        JOIN synths ON preset_synths.synth_id = synths.id
        WHERE artists.id = ?
        GROUP BY synths.id, synths.synth_name
        ORDER BY usageCount DESC
        LIMIT 1`;

      return await DB.get(query, [this.#id]);
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
      const lastId = await DB.run(
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
      const row = await DB.get(`SELECT * FROM artists WHERE id = ?`, [id]);
      return row ? Artist.#fromRow(row) : null;
    } catch (err) {
      throw new Error(`Error fetching artist by ID: ${err.message}`);
    }
  }

  // Deletertist by ID
  static async deleteById(id) {
    try {
      await Promise.all([
        DB.run(`DELETE FROM artists WHERE id = ?`, [id]),
        DB.run(`DELETE FROM song_artists WHERE artist_id = ?`, [id]),
        DB.run(`DELETE FROM artist_clicks WHERE artist_id = ?`, [id]),
      ]);
    } catch (err) {
      throw new Error(`Error deleting artist by ID: ${err.message}`);
    }
  }

  // Return whether artist exists in DB by ID
  static async exists(id) {
    try {
      const artistId = await DB.get(`SELECT id FROM artists WHERE id = ?`, [
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
      const totalResults = await DB.get(
        `SELECT COUNT(*) AS total_results FROM artists`
      );
      return totalResults ? totalResults.total_results : 0;
    } catch (err) {
      throw new Error(`Error fetching total entries: ${err.message}`);
    }
  }

  // Get full artist data by ID
  static async getFullDataById(id) {
    try {
      const query = `
        SELECT
          artists.id AS id,
          artists.name AS name,
          artists.image_url AS imageUrl,
          artists.country AS country,
          artists.timestamp AS timestamp,
          json_group_array(
            DISTINCT CASE
              WHEN songs.id IS NOT NULL THEN
                json_object(
                  'id', songs.id,
                  'title', songs.title,
                  'role', song_artists.role
                )
              ELSE NULL
            END
          ) AS songs
        FROM artists
        LEFT JOIN song_artists ON artists.id = song_artists.artist_id
        LEFT JOIN songs ON song_artists.song_id = songs.id
        WHERE artists.id = ?
        GROUP BY artists.id`;

      const artistData = await DB.get(query, [id]);

      if (artistData) {
        artistData.songs = JSON.parse(artistData.songs || "[]").filter(Boolean);
      }

      return artistData;
    } catch (err) {
      throw new Error(`Error fetching full artist data: ${err.message}`);
    }
  }

  // Update artist by ID
  static async updateById(id, data, files) {
    try {
      await DB.beginTransaction();

      // Update main artist data
      const fields = [];
      const params = [];

      if (data.name) {
        fields.push("name = ?");
        params.push(data.name);
      }

      if (data.country) {
        fields.push("country = ?");
        params.push(data.country);
      }

      if (data.imageUrl) {
        fields.push("image_url = ?");
        params.push(data.imageUrl);
      }

      if (fields.length > 0) {
        params.push(id);
        await DB.run(
          `UPDATE artists SET ${fields.join(", ")} WHERE id = ?`,
          params
        );
      }

      // Update relationships
      if ("songs" in data) {
        await DB.run("DELETE FROM song_artists WHERE artist_id = ?", [id]);
        for (const song of data.songs || []) {
          if (song.id) {
            await DB.run(
              `INSERT INTO song_artists (song_id, artist_id, role) VALUES (?, ?, ?)`,
              [song.id, id, song.role]
            );
          }
        }
      }

      await DB.commit();
    } catch (err) {
      await DB.rollback();
      throw new Error(`Error updating artist ${id}: ${err.message}`);
    }
  }

  // Search artists for autofill dropdown
  static async searchForAutofill(query, limit = 10) {
    try {
      const sql = `
        SELECT id, name as label
        FROM artists 
        WHERE name LIKE ? 
        ORDER BY name 
        LIMIT ?`;

      return await DB.all(sql, [`%${query}%`, limit]);
    } catch (err) {
      throw new Error(`Error searching artists for autofill: ${err.message}`);
    }
  }

  // Get all artists
  static async getAll(sort = "artists.timestamp", direction = "ASC") {
    try {
      // For case-insensitive sorting
      const textFields = ["artists.name", "artists.country"];
      const sortClause = textFields.includes(sort)
        ? `${sort} COLLATE NOCASE ${direction}`
        : `${sort} ${direction}`;

      const query = `
        SELECT
          artists.id AS id,
          artists.name AS name,
          artists.country AS country,
          artists.image_url AS imageUrl,
          artists.timestamp AS timestamp
        FROM artists
        ORDER BY ${sortClause}`;

      return await DB.all(query);
    } catch (err) {
      throw new Error(`Error fetching all artists: ${err.message}`);
    }
  }
}

module.exports = Artist;
