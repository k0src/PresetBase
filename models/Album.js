// Album DB entry model for PresetBase
const DB = require("./DB.js");
const Entry = require("./Entry.js");

class Album extends Entry {
  #id;
  #title;
  #genre;
  #releaseYear;
  #imageUrl;
  #timestamp;

  constructor({ id = null, title, genre, releaseYear, imageUrl, timestamp }) {
    super();
    this.#id = id;
    this.#title = title;
    this.#genre = genre;
    this.#releaseYear = releaseYear;
    this.#imageUrl = imageUrl;
    this.#timestamp = timestamp;
  }

  // Save/Update album
  async save() {
    try {
      if (this.#id) {
        return DB.run(
          `UPDATE albums SET title = ?, genre = ?, release_year = ?, image_url = ?, timestamp = ? WHERE id = ?`,
          [
            this.#title,
            this.#genre,
            this.#releaseYear,
            this.#imageUrl,
            this.#timestamp,
            this.#id,
          ]
        );
      } else {
        return DB.run(
          `INSERT INTO albums (title, genre, release_year, image_url, timestamp) VALUES (?, ?, ?, ?, ?)`,
          [
            this.#title,
            this.#genre,
            this.#releaseYear,
            this.#imageUrl,
            this.#timestamp,
          ]
        );
      }
    } catch (err) {
      throw new Error(`Error saving album: ${err.message}`);
    }
  }

  // Get full album data, including artist and songs
  async getFullData() {
    try {
      const query = `
        SELECT
          albums.id AS id,
          albums.title AS title,
          albums.genre AS genre,
          albums.release_year AS year,
          albums.image_url AS imageUrl,
          albums.timestamp AS timestamp,
      
          (
          SELECT json_object(
            'id', artists.id,
            'name', artists.name
          )
          FROM album_songs
          JOIN song_artists ON album_songs.song_id = song_artists.song_id
          JOIN artists ON song_artists.artist_id = artists.id
          WHERE album_songs.album_id = albums.id
          AND song_artists.role = 'Main'
          LIMIT 1
        ) AS artist,
          
        json_group_array(
          DISTINCT json_object(
            'id', songs.id,
            'title', songs.title,
            'songUrl', songs.song_url,
            'imageUrl', songs.image_url,
            'genre', songs.genre,
            'year', songs.release_year,
            'album', albums.title
          )
        ) AS songs
        
        FROM albums
        JOIN album_songs ON albums.id = album_songs.album_id
        JOIN songs ON songs.id = album_songs.song_id
        WHERE albums.id = ?
        GROUP BY albums.id`;

      const albumData = await DB.get(query, [this.#id]);

      if (albumData) {
        albumData.songs = JSON.parse(albumData.songs || "[]");
        albumData.artist = JSON.parse(albumData.artist || "{}");
      }

      return albumData;
    } catch (err) {
      throw new Error(`Error fetching full album data: ${err.message}`);
    }
  }

  // Returns more albums by the same artist, ordered by clicks
  async getMoreAlbums(limit = null) {
    try {
      let query = `
        SELECT
          albums.id AS id,
          albums.title AS title,
          albums.image_url AS imageUrl,
          COALESCE(album_clicks.clicks, 0) AS clicks
        FROM albums
        LEFT JOIN album_songs ON albums.id = album_songs.album_id
        LEFT JOIN song_artists ON album_songs.song_id = song_artists.song_id
        LEFT JOIN album_clicks ON albums.id = album_clicks.album_id
        WHERE song_artists.artist_id = (
          SELECT artists.id
            FROM album_songs
            JOIN song_artists ON album_songs.song_id = song_artists.song_id
            JOIN artists ON song_artists.artist_id = artists.id
          WHERE album_songs.album_id = ?
            AND song_artists.role = 'Main'
          LIMIT 1
        )
        AND song_artists.role = 'Main'
        AND albums.title != '[SINGLE]'
        AND albums.id != ?
        GROUP BY albums.id
        ORDER BY clicks DESC`;

      const params = [this.#id, this.#id];
      if (limit) {
        query += ` LIMIT ?`;
        params.push(limit);
      }

      return await DB.all(query, params);
    } catch (err) {
      throw new Error(`Error fetching more albums: ${err.message}`);
    }
  }

  // Returns instance as an object
  toJSON() {
    return {
      id: this.#id,
      title: this.#title,
      genre: this.#genre,
      releaseYear: this.#releaseYear,
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

  get imageUrl() {
    return this.#imageUrl;
  }

  get timestamp() {
    return this.#timestamp;
  }

  // Setters
  set title(title) {
    this.#title = title;
  }

  set genre(genre) {
    this.#genre = genre;
  }

  set releaseYear(year) {
    this.#releaseYear = year;
  }

  set imageUrl(imageUrl) {
    this.#imageUrl = imageUrl;
  }

  set timestamp(timestamp) {
    this.#timestamp = timestamp;
  }

  /* ----------------------------- Static Methods ----------------------------- */
  // Create, insert, and return a new Album instance
  static async create({ title, genre, releaseYear, imageUrl }) {
    try {
      const now = new Date().toISOString();
      const lastId = await DB.run(
        `INSERT INTO albums (title, genre, release_year, image_url, timestamp)
         VALUES (?, ?, ?, ?, ?)`,
        [title, genre, releaseYear, imageUrl, now]
      );

      return new Album({
        id: lastId,
        title,
        genre,
        releaseYear,
        imageUrl,
        timestamp: now,
      });
    } catch (err) {
      throw new Error(`Error creating Album: ${err.message}`);
    }
  }

  // Returns new Album instance from a DB row
  static #fromRow(row) {
    return new Album({
      id: row.id,
      title: row.title,
      genre: row.genre,
      releaseYear: row.release_year,
      imageUrl: row.image_url,
      timestamp: row.timestamp,
    });
  }

  // Get album by ID
  static async getById(id) {
    try {
      const row = await DB.get(`SELECT * FROM albums WHERE id = ?`, [id]);
      return row ? Album.#fromRow(row) : null;
    } catch (err) {
      throw new Error(`Error fetching album by ID: ${err.message}`);
    }
  }

  // Delete album by ID
  static async deleteById(id) {
    try {
      await Promise.all([
        DB.run(`DELETE FROM albums WHERE id = ?`, [id]),
        DB.run(`DELETE FROM album_songs WHERE album_id = ?`, [id]),
        DB.run(`DELETE FROM album_clicks WHERE album_id = ?`, [id]),
      ]);
    } catch (err) {
      throw new Error(`Error deleting album: ${err.message}`);
    }
  }

  // Return whether album exists in DB by ID
  static async exists(id) {
    try {
      const albumId = await DB.get(`SELECT id FROM albums WHERE id = ?`, [id]);
      return !!albumId;
    } catch (err) {
      throw new Error(`Error checking album existence: ${err.message}`);
    }
  }

  // Get total number of albums in DB
  static async totalEntries() {
    try {
      const totalResults = await DB.get(
        `SELECT COUNT(*) AS total_results FROM albums`
      );
      return totalResults ? totalResults.total_results : 0;
    } catch (err) {
      throw new Error(`Error fetching total entries: ${err.message}`);
    }
  }

  // Get all albums
  static async getAll(sort = "albums.timestamp", direction = "ASC") {
    try {
      // For case-insensitive sorting
      const textFields = ["albums.title", "albums.genre", "artists.name"];
      const sortClause = textFields.includes(sort)
        ? `${sort} COLLATE NOCASE ${direction}`
        : `${sort} ${direction}`;

      const query = `
        SELECT
          albums.id AS id,
          albums.title AS title,
          albums.genre AS genre,
          albums.release_year AS year,
          albums.image_url AS imageUrl,
          json_object (
            'id', artists.id,
            'name', artists.name
          ) AS artist,
          albums.timestamp AS timestamp
        FROM albums
        LEFT JOIN album_songs ON albums.id = album_songs.album_id
        LEFT JOIN songs ON album_songs.song_id = songs.id
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        LEFT JOIN album_clicks ON album_clicks.album_id = albums.id
        WHERE song_artists.role = 'Main' AND albums.title NOT LIKE '[SINGLE]'
        GROUP BY albums.id
        ORDER BY ${sortClause}`;

      const albumsData = await DB.all(query);

      if (albumsData) {
        albumsData.forEach((album) => {
          album.artist = JSON.parse(album.artist || "{}");
        });
      }

      return albumsData;
    } catch (err) {
      throw new Error(`Error fetching all albums: ${err.message}`);
    }
  }
}

module.exports = Album;
