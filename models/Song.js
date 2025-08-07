// Song DB entry model for PresetBase
const DB = require("./DB.js");
const Entry = require("./Entry.js");

class Song extends Entry {
  #id;
  #title;
  #genre;
  #releaseYear;
  #songUrl;
  #imageUrl;
  #timestamp;

  constructor({ id = null, title, genre, releaseYear, songUrl, imageUrl }) {
    super();
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
        return DB.dbRun(
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
        return DB.dbRun(
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
          songs.id AS id,
          songs.title AS title,
          songs.song_url AS songUrl,
          songs.image_url AS imageUrl,
          songs.genre AS genre,
          songs.release_year AS year,
          songs.timestamp AS timestamp,
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
              'id', presets.id,
              'name', presets.preset_name,
              'usageType', song_presets.usage_type,
              'audioUrl', song_presets.audio_url,
              'synth', json_object(
                'id', synths.id,
                'name', synths.synth_name,
                'imageUrl', synths.image_url
              )
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

      const songData = await DB.dbGet(query, [this.#id]);

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
      let query = `
        SELECT
          songs.id AS id,
          songs.title AS title,
          songs.image_url AS imageUrl
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
        ORDER BY COALESCE(song_clicks.clicks, 0) DESC`;

      let params = [this.#id, this.#id];
      if (typeof limit === "number" && limit > 0) {
        query += ` LIMIT ?`;
        params.push(limit);
      }

      return await DB.dbAll(query, params);
    } catch (err) {
      throw new Error(`Error fetching more songs: ${err.message}`);
    }
  }

  // Returns instance as an object
  toJSON() {
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
      const lastId = await DB.dbRun(
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
        timestamp: now,
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
      timestamp: row.timestamp,
    });
  }

  // Get song by ID
  static async getById(id) {
    try {
      const row = await DB.dbGet(`SELECT * FROM songs WHERE id = ?`, [id]);
      return row ? Song.#fromRow(row) : null;
    } catch (err) {
      throw new Error(`Error fetching song by ID: ${err.message}`);
    }
  }

  // Delete song by ID
  static async deleteById(id) {
    try {
      await Promise.all([
        DB.dbRun(`DELETE FROM song_artists WHERE song_id = ?`, [id]),
        DB.dbRun(`DELETE FROM song_presets WHERE song_id = ?`, [id]),
        DB.dbRun(`DELETE FROM song_clicks WHERE song_id = ?`, [id]),
        DB.dbRun(`DELETE FROM album_songs WHERE song_id = ?`, [id]),
        DB.dbRun(`DELETE FROM songs WHERE id = ?`, [id]),
      ]);
    } catch (err) {
      throw new Error(`Error deleting song by ID: ${err.message}`);
    }
  }

  // Return whether song exists in DB by ID
  static async exists(id) {
    try {
      const songId = await DB.dbGet(`SELECT id FROM songs WHERE id = ?`, [id]);
      return !!songId;
    } catch (err) {
      throw new Error(`Error checking song existence: ${err.message}`);
    }
  }

  // Get total number of songs in DB
  static async totalEntries() {
    try {
      const totalResults = await DB.dbGet(
        `SELECT COUNT(*) AS total_results FROM songs`
      );
      return totalResults ? totalResults.total_results : 0;
    } catch (err) {
      throw new Error(`Error fetching total entries: ${err.message}`);
    }
  }

  // Get all songs
  static async getAll(sort = "songs.timestamp", direction = "ASC") {
    try {
      // For case-insensitive sorting
      const textFields = [
        "songs.title",
        "songs.genre",
        "artists.name",
        "albums.title",
      ];
      const sortClause = textFields.includes(sort)
        ? `${sort} COLLATE NOCASE ${direction}`
        : `${sort} ${direction}`;

      const query = `
        SELECT
          songs.id AS id,
          songs.title AS title,
          songs.genre AS genre,
          songs.release_year AS year,
          songs.image_url AS imageUrl,
          songs.timestamp AS timestamp,
          json_object (
            'id', artists.id,
            'name', artists.name
          ) AS artist,
          json_object (
            'id', albums.id,
            'title', albums.title
          ) AS album
        FROM songs
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        LEFT JOIN album_songs ON songs.id = album_songs.song_id
        LEFT JOIN albums ON album_songs.album_id = albums.id
        WHERE song_artists.role = 'Main'
        GROUP BY songs.id
        ORDER BY ${sortClause}`;

      const songsData = await DB.dbAll(query);

      if (songsData) {
        songsData.forEach((song) => {
          song.artist = JSON.parse(song.artist || "{}");
          song.album = JSON.parse(song.album || "{}");
        });
      }

      return songsData;
    } catch (err) {
      throw new Error(`Error fetching all songs: ${err.message}`);
    }
  }

  // Get hot songs
  static async getHotSongs(sort = "hotScore", direction = "DESC") {
    try {
      // For case-insensitive sorting
      const textFields = [
        "title",
        "genre",
        "json_extract(artist, '$.name')",
        "json_extract(album, '$.title')",
      ];
      const sortClause = textFields.includes(sort)
        ? `${sort} COLLATE NOCASE ${direction}`
        : `${sort} ${direction}`;

      const query = `
        WITH hotSongs AS (
          SELECT
            songs.id AS id,
            songs.title AS title,
            songs.genre AS genre,
            songs.release_year year,
            songs.image_url AS imageUrl,
            songs.timestamp AS timestamp,
            json_object (
              'id', artists.id,
              'name', artists.name
            ) AS artist,
            json_object (
              'id', albums.id,
              'title', albums.title
            ) AS album,
            (
              0.6 * COALESCE(MAX(song_clicks.recent_click), 0) +
              0.3 * COALESCE(MAX(song_clicks.clicks), 0) +
              0.1 * (
                1.0 / NULLIF((julianday('now') - julianday(songs.timestamp)) + 1, 0)
              )
            ) AS hotScore
          FROM songs
          LEFT JOIN song_artists ON songs.id = song_artists.song_id
          LEFT JOIN artists ON song_artists.artist_id = artists.id
          LEFT JOIN album_songs ON songs.id = album_songs.song_id
          LEFT JOIN albums ON album_songs.album_id = albums.id
          LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
          WHERE song_artists.role = 'Main'
          GROUP BY songs.id
          ORDER BY hotScore DESC
          LIMIT 10
        )
        SELECT * FROM hotSongs
        ORDER BY ${sortClause}`;

      const hotSongsData = await DB.dbAll(query);

      if (hotSongsData) {
        hotSongsData.forEach((song) => {
          song.artist = JSON.parse(song.artist || "{}");
          song.album = JSON.parse(song.album || "{}");
        });
      }

      return hotSongsData;
    } catch (err) {
      throw new Error(`Error fetching hot songs: ${err.message}`);
    }
  }

  // Get popular songs
  static async getPopularSongs(sort = "clicks", direction = "DESC") {
    try {
      // For case-insensitive sorting
      const textFields = [
        "title",
        "genre",
        "json_extract(artist, '$.name')",
        "json_extract(album, '$.title')",
      ];
      const sortClause = textFields.includes(sort)
        ? `${sort} COLLATE NOCASE ${direction}`
        : `${sort} ${direction}`;

      const query = `
        WITH popularSongs AS (
          SELECT
              songs.id AS id,
              songs.title AS title,
              songs.genre AS genre,
              songs.release_year AS year,
              songs.image_url AS imageUrl,
              songs.timestamp AS timestamp,
              json_object (
                'id', artists.id,
                'name', artists.name
              ) AS artist,
              json_object (
                'id', albums.id,
                'title', albums.title
              ) AS album,
              COALESCE(MAX(song_clicks.clicks), 0) AS clicks
          FROM songs
          LEFT JOIN song_artists ON songs.id = song_artists.song_id
          LEFT JOIN artists ON song_artists.artist_id = artists.id
          LEFT JOIN album_songs ON songs.id = album_songs.song_id
          LEFT JOIN albums ON album_songs.album_id = albums.id
          LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
          WHERE song_artists.role = 'Main'
          GROUP BY songs.id
          ORDER BY song_clicks.clicks DESC
          LIMIT 10
        )
        SELECT * FROM popularSongs
        ORDER BY ${sortClause}`;

      const popularSongsData = await DB.dbAll(query);

      if (popularSongsData) {
        popularSongsData.forEach((song) => {
          song.artist = JSON.parse(song.artist || "{}");
          song.album = JSON.parse(song.album || "{}");
        });
      }

      return popularSongsData;
    } catch (err) {
      throw new Error(`Error fetching popular songs: ${err.message}`);
    }
  }

  // Get recently added songs
  static async getRecentSongs(sort = "timestamp", direction = "DESC") {
    try {
      // For case-insensitive sorting
      const textFields = [
        "title",
        "genre",
        "json_extract(artist, '$.name')",
        "json_extract(album, '$.title')",
      ];
      const sortClause = textFields.includes(sort)
        ? `${sort} COLLATE NOCASE ${direction}`
        : `${sort} ${direction}`;

      const query = `
        WITH recentSongs AS (
          SELECT
              songs.id AS id,
              songs.title AS title,
              songs.genre AS genre,
              songs.release_year AS year,
              songs.image_url AS imageUrl,
              songs.timestamp AS timestamp,
              json_object (
                'id', artists.id,
                'name', artists.name
              ) AS artist,
              json_object (
                'id', albums.id,
                'title', albums.title
              ) AS album
          FROM songs
          LEFT JOIN song_artists ON songs.id = song_artists.song_id
          LEFT JOIN artists ON song_artists.artist_id = artists.id
          LEFT JOIN album_songs ON songs.id = album_songs.song_id
          LEFT JOIN albums ON album_songs.album_id = albums.id
          LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
          WHERE song_artists.role = 'Main'
          GROUP BY songs.id
          ORDER BY songs.timestamp DESC
          LIMIT 10
        )
        SELECT * FROM recentSongs
        ORDER BY ${sortClause}`;

      const recentSongsData = await DB.dbAll(query);

      if (recentSongsData) {
        recentSongsData.forEach((song) => {
          song.artist = JSON.parse(song.artist || "{}");
          song.album = JSON.parse(song.album || "{}");
        });
      }

      return recentSongsData;
    } catch (err) {
      throw new Error(`Error fetching recent songs: ${err.message}`);
    }
  }
}

module.exports = Song;
