// Song DB entry model for PresetBase
import DB from "./DB.js";
import Entry from "./Entry.js";

export default class Song extends Entry {
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
        return DB.run(
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
        return DB.run(
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

      const songData = await DB.get(query, [this.#id]);

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

      return await DB.all(query, params);
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
      const lastId = await DB.run(
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
      const row = await DB.get(`SELECT * FROM songs WHERE id = ?`, [id]);
      return row ? Song.#fromRow(row) : null;
    } catch (err) {
      throw new Error(`Error fetching song by ID: ${err.message}`);
    }
  }

  // Delete song by ID
  static async deleteById(id) {
    try {
      await Promise.all([
        DB.run(`DELETE FROM song_artists WHERE song_id = ?`, [id]),
        DB.run(`DELETE FROM song_presets WHERE song_id = ?`, [id]),
        DB.run(`DELETE FROM song_clicks WHERE song_id = ?`, [id]),
        DB.run(`DELETE FROM album_songs WHERE song_id = ?`, [id]),
        DB.run(`DELETE FROM songs WHERE id = ?`, [id]),
      ]);
    } catch (err) {
      throw new Error(`Error deleting song by ID: ${err.message}`);
    }
  }

  // Return whether song exists in DB by ID
  static async exists(id) {
    try {
      const songId = await DB.get(`SELECT id FROM songs WHERE id = ?`, [id]);
      return !!songId;
    } catch (err) {
      throw new Error(`Error checking song existence: ${err.message}`);
    }
  }

  // Get total number of songs in DB
  static async totalEntries() {
    try {
      const totalResults = await DB.get(
        `SELECT COUNT(*) AS total_results FROM songs`
      );
      return totalResults ? totalResults.total_results : 0;
    } catch (err) {
      throw new Error(`Error fetching total entries: ${err.message}`);
    }
  }

  // Get full song data by ID
  static async getFullDataById(id) {
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
            DISTINCT CASE
              WHEN artists.id IS NOT NULL THEN
                json_object(
                  'id', artists.id,
                  'name', artists.name,
                  'role', song_artists.role
                )
              ELSE NULL
            END
          ) AS artists,

          json_group_array(
            DISTINCT CASE
              WHEN presets.id IS NOT NULL THEN
                json_object(
                  'id', presets.id,
                  'name', presets.preset_name,
                  'usageType', song_presets.usage_type,
                  'audioUrl', song_presets.audio_url,
                  'songPresetsRowId', song_presets.id,
                  'synth', json_object(
                    'id', synths.id,
                    'name', synths.synth_name,
                    'imageUrl', synths.image_url
                  )
                )
              ELSE NULL
            END
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

      const songData = await DB.get(query, [id]);

      if (songData) {
        songData.album = JSON.parse(songData.album || "{}");
        songData.artists = JSON.parse(songData.artists || "[]").filter(Boolean);
        songData.presets = JSON.parse(songData.presets || "[]").filter(Boolean);
      }

      return songData;
    } catch (err) {
      throw new Error(`Error fetching full song data: ${err.message}`);
    }
  }

  // Update song by ID
  static async updateById(id, data) {
    try {
      await DB.beginTransaction();

      // Update main song data
      const fields = [];
      const params = [];

      if (data.title) {
        fields.push("title = ?");
        params.push(data.title);
      }

      if (data.genre) {
        fields.push("genre = ?");
        params.push(data.genre);
      }

      if (data.year) {
        fields.push("release_year = ?");
        params.push(data.year);
      }

      if (data.songUrl) {
        fields.push("song_url = ?");
        params.push(data.songUrl);
      }

      if (data.imageUrl) {
        fields.push("image_url = ?");
        params.push(data.imageUrl);
      }

      if (fields.length > 0) {
        params.push(id);
        await DB.run(
          `UPDATE songs SET ${fields.join(", ")} WHERE id = ?`,
          params
        );
      }

      // Update relationships
      if ("album" in data) {
        await DB.run("DELETE FROM album_songs WHERE song_id = ?", [id]);
        if (data.album) {
          await DB.run(
            "INSERT INTO album_songs (song_id, album_id) VALUES (?, ?)",
            [id, data.album]
          );
        }
      }

      if ("artists" in data) {
        await DB.run("DELETE FROM song_artists WHERE song_id = ?", [id]);
        for (const artist of data.artists || []) {
          if (artist.id) {
            await DB.run(
              "INSERT INTO song_artists (song_id, artist_id, role) VALUES (?, ?, ?)",
              [id, artist.id, artist.role]
            );
          }
        }
      }

      if ("presets" in data) {
        for (const preset of data.presets || []) {
          // If it has a row ID, then it's old
          if (preset.songPresetsRowId) {
            const presetFields = [];
            const presetParams = [];

            if (preset.usageType) {
              presetFields.push("usage_type = ?");
              presetParams.push(preset.usageType);
            }

            if (preset.audioUrl) {
              presetFields.push("audio_url = ?");
              presetParams.push(preset.audioUrl);
            }

            presetParams.push(preset.songPresetsRowId);

            if (presetFields.length > 0) {
              await DB.run(
                `UPDATE song_presets
                 SET ${presetFields.join(", ")}
                 WHERE id = ?`,
                presetParams
              );
            }
          } else {
            // No row ID = new preset
            await DB.run(
              `INSERT INTO song_presets 
                (song_id, preset_id, usage_type, verified, audio_url, timestamp)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                id,
                preset.id,
                preset.usageType,
                "t",
                preset.audioUrl,
                new Date().toISOString(),
              ]
            );
          }
        }
      }

      await DB.commit();
    } catch (err) {
      await DB.rollback();
      throw new Error(`Error updating song ${id}: ${err.message}`);
    }
  }

  // Search songs for autofill dropdown
  static async searchForAutofill(query, limit = 10) {
    try {
      const sql = `
        SELECT id, title as label
        FROM songs 
        WHERE title LIKE ? 
        ORDER BY title 
        LIMIT ?`;

      return await DB.all(sql, [`%${query}%`, limit]);
    } catch (err) {
      throw new Error(`Error searching songs for autofill: ${err.message}`);
    }
  }

  // Get latest song
  static async getLatestSong() {
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
        GROUP BY songs.id
        ORDER BY songs.timestamp DESC
        LIMIT 1`;

      const songData = await DB.get(query);

      if (songData) {
        songData.album = JSON.parse(songData.album || "{}");
        songData.artists = JSON.parse(songData.artists || "[]");
        songData.presets = JSON.parse(songData.presets || "[]");
      }

      return songData;
    } catch (err) {
      throw new Error(`Error fetching latest song: ${err.message}`);
    }
  }

  // Get all songs
  static async getAll(
    sort = "songs.timestamp",
    direction = "ASC",
    limit = null
  ) {
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
          songs.song_url AS songUrl,
          songs.image_url AS imageUrl,
          songs.timestamp AS timestamp,
          CASE
            WHEN artists.id IS NOT NULL THEN
              json_object(
                'id', artists.id,
                'name', artists.name
              )
            ELSE NULL
          END AS artist,
          json_object(
            'id', albums.id,
            'title', albums.title
          ) AS album,
          json_object(
            'name', genre_tags.name,
            'textColor', genre_tags.text_color,
            'bgColor', genre_tags.bg_color,
            'borderColor', genre_tags.border_color
          ) AS genreTag
        FROM songs
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
          AND song_artists.role = 'Main'
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        LEFT JOIN album_songs ON songs.id = album_songs.song_id
        LEFT JOIN albums ON album_songs.album_id = albums.id
        LEFT JOIN song_genres ON songs.id = song_genres.song_id
        LEFT JOIN genre_tags ON song_genres.genre_id = genre_tags.id
        GROUP BY songs.id
        ORDER BY ${sortClause}
        ${limit ? "LIMIT ?" : ""}`;

      const params = [];
      if (limit) params.push(limit);

      const songsData = await DB.all(query, params);

      if (songsData) {
        songsData.forEach((song) => {
          song.artist = JSON.parse(song.artist || "{}");
          song.album = JSON.parse(song.album || "{}");
          song.genreTag = JSON.parse(song.genreTag || "{}");
        });
      }

      return songsData;
    } catch (err) {
      throw new Error(`Error fetching all songs: ${err.message}`);
    }
  }

  // Get hot songs
  static async getHotSongs(
    sort = "hotScore",
    direction = "DESC",
    limit = null
  ) {
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
            json_object(
              'name', genre_tags.name,
              'textColor', genre_tags.text_color,
              'bgColor', genre_tags.bg_color,
              'borderColor', genre_tags.border_color
            ) AS genreTag,
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
          LEFT JOIN song_genres ON songs.id = song_genres.song_id
          LEFT JOIN genre_tags ON song_genres.genre_id = genre_tags.id
          WHERE song_artists.role = 'Main'
          GROUP BY songs.id
          ORDER BY hotScore DESC
          LIMIT 10
        )
        SELECT * FROM hotSongs
        ORDER BY ${sortClause}
        ${limit ? "LIMIT ?" : ""}`;

      const params = [];
      if (limit) params.push(limit);

      const hotSongsData = await DB.all(query, params);

      if (hotSongsData) {
        hotSongsData.forEach((song) => {
          song.artist = JSON.parse(song.artist || "{}");
          song.album = JSON.parse(song.album || "{}");
          song.genreTag = JSON.parse(song.genreTag || "{}");
        });
      }

      return hotSongsData;
    } catch (err) {
      throw new Error(`Error fetching hot songs: ${err.message}`);
    }
  }

  // Get popular songs
  static async getPopularSongs(
    sort = "clicks",
    direction = "DESC",
    limit = null
  ) {
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
              json_object(
                'name', genre_tags.name,
                'textColor', genre_tags.text_color,
                'bgColor', genre_tags.bg_color,
                'borderColor', genre_tags.border_color
              ) AS genreTag,
              COALESCE(MAX(song_clicks.clicks), 0) AS clicks
          FROM songs
          LEFT JOIN song_artists ON songs.id = song_artists.song_id
          LEFT JOIN artists ON song_artists.artist_id = artists.id
          LEFT JOIN album_songs ON songs.id = album_songs.song_id
          LEFT JOIN albums ON album_songs.album_id = albums.id
          LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
          LEFT JOIN song_genres ON songs.id = song_genres.song_id
          LEFT JOIN genre_tags ON song_genres.genre_id = genre_tags.id
          WHERE song_artists.role = 'Main'
          GROUP BY songs.id
          ORDER BY song_clicks.clicks DESC
          LIMIT 10
        )
        SELECT * FROM popularSongs
        ORDER BY ${sortClause}
        ${limit ? "LIMIT ?" : ""}`;

      const params = [];
      if (limit) params.push(limit);

      const popularSongsData = await DB.all(query, params);

      if (popularSongsData) {
        popularSongsData.forEach((song) => {
          song.artist = JSON.parse(song.artist || "{}");
          song.album = JSON.parse(song.album || "{}");
          song.genreTag = JSON.parse(song.genreTag || "{}");
        });
      }

      return popularSongsData;
    } catch (err) {
      throw new Error(`Error fetching popular songs: ${err.message}`);
    }
  }

  // Get recently added songs
  static async getRecentSongs(
    sort = "timestamp",
    direction = "DESC",
    limit = null
  ) {
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
              ) AS album,
              json_object(
                'name', genre_tags.name,
                'textColor', genre_tags.text_color,
                'bgColor', genre_tags.bg_color,
                'borderColor', genre_tags.border_color
              ) AS genreTag
          FROM songs
          LEFT JOIN song_artists ON songs.id = song_artists.song_id
          LEFT JOIN artists ON song_artists.artist_id = artists.id
          LEFT JOIN album_songs ON songs.id = album_songs.song_id
          LEFT JOIN albums ON album_songs.album_id = albums.id
          LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
          LEFT JOIN song_genres ON songs.id = song_genres.song_id
          LEFT JOIN genre_tags ON song_genres.genre_id = genre_tags.id
          WHERE song_artists.role = 'Main'
          GROUP BY songs.id
          ORDER BY songs.timestamp DESC
          LIMIT 10
        )
        SELECT * FROM recentSongs
        ORDER BY ${sortClause}
        ${limit ? "LIMIT ?" : ""}`;

      const params = [];
      if (limit) params.push(limit);

      const recentSongsData = await DB.all(query, params);

      if (recentSongsData) {
        recentSongsData.forEach((song) => {
          song.artist = JSON.parse(song.artist || "{}");
          song.album = JSON.parse(song.album || "{}");
          song.genreTag = JSON.parse(song.genreTag || "{}");
        });
      }

      return recentSongsData;
    } catch (err) {
      throw new Error(`Error fetching recent songs: ${err.message}`);
    }
  }
}
