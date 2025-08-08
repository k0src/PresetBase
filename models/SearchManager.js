// Search Manager model for PresetBase
const DB = require("./DB.js");

class SearchManager {
  static async getSearchResults(searchQuery) {
    const queries = {
      totalResults: `
        SELECT
          (SELECT COUNT(*) FROM songs WHERE LOWER(title) LIKE ?) +
          (SELECT COUNT(*) FROM artists WHERE LOWER(name) LIKE ?) +
          (SELECT COUNT(*) FROM albums WHERE LOWER(title) LIKE ?) +
          (SELECT COUNT(*) FROM synths WHERE LOWER(synth_name) LIKE ?) +
          (SELECT COUNT(*) FROM presets WHERE LOWER(preset_name) LIKE ?)
        AS totalResults
    `,

      songs: `
        SELECT
          songs.id AS id,
          songs.title AS title,
          songs.genre AS genre,
          songs.release_year AS year,
          songs.image_url AS imageUrl,
          json_object (
            'id', artists.id,
            'name', artists.name
          ) AS artist,
          json_object (
            'id', albums.id,
            'title', albums.title
          ) AS album,

          CASE
            WHEN LOWER(songs.title) = LOWER(?) THEN 3
            WHEN LOWER(songs.title) LIKE LOWER(?) || '%' THEN 2
            WHEN LOWER(songs.title) LIKE '%' || LOWER(?) || '%' THEN 1
            ELSE 0
          END AS relevanceScore

        FROM songs
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        LEFT JOIN album_songs ON songs.id = album_songs.song_id
        LEFT JOIN albums ON album_songs.album_id = albums.id
        WHERE song_artists.role = 'Main' AND LOWER(songs.title) LIKE '%' || LOWER(?) || '%'
        GROUP BY songs.id
        ORDER BY relevanceScore DESC, songs.title`,

      artists: `
        SELECT
          artists.id AS id,
          artists.name AS name,
          artists.country AS country,
          artists.image_url AS imageUrl,

          CASE
            WHEN LOWER(artists.name) = LOWER(?) THEN 3
            WHEN LOWER(artists.name) LIKE LOWER(?) || '%' THEN 2
            WHEN LOWER(artists.name) LIKE '%' || LOWER(?) || '%' THEN 1
            ELSE 0
          END AS relevanceScore

        FROM artists 
        WHERE LOWER(artists.name) LIKE '%' || LOWER(?) || '%'
        ORDER BY relevanceScore DESC, artists.name`,

      albums: `
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

          CASE
            WHEN LOWER(albums.title) = LOWER(?) THEN 3
            WHEN LOWER(albums.title) LIKE LOWER(?) || '%' THEN 2
            WHEN LOWER(albums.title) LIKE '%' || LOWER(?) || '%' THEN 1
            ELSE 0
          END AS relevanceScore

        FROM albums
        LEFT JOIN album_songs ON albums.id = album_songs.album_id
        LEFT JOIN songs ON album_songs.song_id = songs.id
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        WHERE song_artists.role = 'Main' AND albums.title NOT LIKE '[SINGLE]'
        AND LOWER(albums.title) LIKE '%' || LOWER(?) || '%'
        GROUP BY albums.id
        ORDER BY relevanceScore DESC, albums.title`,

      synths: `
        SELECT
          synths.id AS id,
          synths.synth_name AS name,
          synths.manufacturer AS manufacturer,
          synths.release_year AS year,
          synths.image_url AS imageUrl,
          synths.synth_type AS type,

          CASE
            WHEN LOWER(synths.synth_name) = LOWER(?) THEN 3
            WHEN LOWER(synths.synth_name) LIKE LOWER(?) || '%' THEN 2
            WHEN LOWER(synths.synth_name) LIKE '%' || LOWER(?) || '%' THEN 1
            ELSE 0
          END AS relevanceScore

        FROM synths
        WHERE LOWER(synths.synth_name) LIKE '%' || LOWER(?) || '%'
        ORDER BY relevanceScore DESC, synths.synth_name`,

      presets: `
        SELECT
          presets.id AS id,
          presets.preset_name AS name,
          presets.pack_name AS packName,
          presets.author AS author,
          json_object (
            'id', synths.id,
            'name', synths.synth_name,
            'imageUrl', synths.image_url
          ) AS synth,

          CASE
            WHEN LOWER(presets.preset_name) = LOWER(?) THEN 3
            WHEN LOWER(presets.preset_name) LIKE LOWER(?) || '%' THEN 2
            WHEN LOWER(presets.preset_name) LIKE '%' || LOWER(?) || '%' THEN 1
            ELSE 0
          END AS relevanceScore

        FROM presets
        LEFT JOIN preset_synths ON presets.id = preset_synths.preset_id
        LEFT JOIN synths ON preset_synths.synth_id = synths.id
        WHERE LOWER(presets.preset_name) LIKE '%' || LOWER(?) || '%'
        GROUP BY presets.id
        ORDER BY relevanceScore DESC, presets.preset_name`,
    };

    const escapeLike = (str) => str.replace(/[\\%_]/g, "\\$&");

    try {
      const escapedQuery = escapeLike(searchQuery);

      const [totalResults, songs, artists, albums, synths, presets] =
        await Promise.all([
          DB.get(queries.totalResults, Array(5).fill(`%${escapedQuery}%`)),
          DB.all(queries.songs, Array(4).fill(`%${escapedQuery}%`)),
          DB.all(queries.artists, Array(4).fill(`%${escapedQuery}%`)),
          DB.all(queries.albums, Array(4).fill(`%${escapedQuery}%`)),
          DB.all(queries.synths, Array(4).fill(`%${escapedQuery}%`)),
          DB.all(queries.presets, Array(4).fill(`%${escapedQuery}%`)),
        ]);

      if (songs) {
        songs.forEach((song) => {
          song.artist = JSON.parse(song.artist || "{}");
          song.album = JSON.parse(song.album || "{}");
        });
      }
      if (albums) {
        albums.forEach((album) => {
          album.artist = JSON.parse(album.artist || "{}");
        });
      }
      if (presets) {
        presets.forEach((preset) => {
          preset.synth = JSON.parse(preset.synth || "{}");
        });
      }

      return {
        totalResults: totalResults?.totalResults ?? 0,
        songs: songs || [],
        artists: artists || [],
        albums: albums || [],
        synths: synths || [],
        presets: presets || [],
        searchQuery,
      };
    } catch (err) {
      throw new Error(`Error executing search: ${err.message}`);
    }
  }
}

module.exports = SearchManager;
