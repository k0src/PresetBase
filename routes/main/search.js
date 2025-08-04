const express = require("express");
const router = express.Router();
const { dbAll, dbGet, getGenreStyles } = require("../../util/UTIL.js");

router.get("/", async (req, res) => {
  const searchQuery = req.query.query.toLowerCase().trim();

  const queries = {
    totalResults: `
      SELECT
        (SELECT COUNT(*) FROM songs WHERE LOWER(title) LIKE ?) +
        (SELECT COUNT(*) FROM artists WHERE LOWER(name) LIKE ?) +
        (SELECT COUNT(*) FROM albums WHERE LOWER(title) LIKE ?) +
        (SELECT COUNT(*) FROM synths WHERE LOWER(synth_name) LIKE ?) +
        (SELECT COUNT(*) FROM presets WHERE LOWER(preset_name) LIKE ?)
      AS total_results
    `,

    songs: `
      SELECT
        songs.id AS song_id,
        songs.title AS song_title,
        songs.genre AS song_genre,
        songs.release_year AS song_release_year,
        songs.image_url AS song_image,
        artists.name AS artist_name,
        artists.id AS artist_id,
        albums.title AS album_title,
        albums.id AS album_id
      FROM songs
      LEFT JOIN song_artists ON songs.id = song_artists.song_id
      LEFT JOIN artists ON song_artists.artist_id = artists.id
      LEFT JOIN album_songs ON songs.id = album_songs.song_id
      LEFT JOIN albums ON album_songs.album_id = albums.id
      LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
      WHERE song_artists.role = 'Main' AND LOWER(songs.title) LIKE ?
      GROUP BY songs.id
      ORDER BY songs.title`,

    artists: `
      SELECT
        artists.name AS artist_name,
        artists.id AS artist_id,
        artists.country AS artist_country,
        artists.image_url AS artist_image
      FROM artists WHERE LOWER(artists.name) LIKE ?
      ORDER BY artists.name`,

    albums: `
      SELECT
        albums.id AS album_id,
        albums.title AS album_title,
        albums.genre AS album_genre,
        albums.release_year AS album_release_year,
        albums.image_url AS album_image,
        artists.name AS artist_name,
        artists.id AS artist_id
      FROM albums
      LEFT JOIN album_songs ON albums.id = album_songs.album_id
      LEFT JOIN songs ON album_songs.song_id = songs.id
      LEFT JOIN song_artists ON songs.id = song_artists.song_id
      LEFT JOIN artists ON song_artists.artist_id = artists.id
      WHERE song_artists.role = 'Main' AND albums.title NOT LIKE '[SINGLE]'
      AND LOWER(albums.title) LIKE ?
      GROUP BY albums.id
      ORDER BY albums.title`,

    synths: `
      SELECT
        synths.synth_name AS synth_name,
        synths.id AS synth_id,
        synths.manufacturer AS synth_manufacturer,
        synths.release_year AS synth_release_year,
        synths.image_url AS synth_image,
        synths.synth_type AS synth_type
      FROM synths
      WHERE LOWER(synths.synth_name) LIKE ?
      ORDER BY synths.synth_name`,

    presets: `
      SELECT
        presets.id AS preset_id,
        presets.preset_name AS preset_name,
        presets.pack_name AS preset_pack_name,
        presets.author AS preset_author,
        synths.id AS synth_id,
        synths.synth_name AS synth_name,
        synths.image_url AS synth_image
      FROM presets
      LEFT JOIN preset_synths ON presets.id = preset_synths.preset_id
      LEFT JOIN synths ON preset_synths.synth_id = synths.id
      WHERE LOWER(presets.preset_name) LIKE ?
      GROUP BY presets.id
      ORDER BY presets.preset_name`,
  };

  const isAuth = req.isAuthenticated();
  const userIsAdmin = isAuth && req.user && req.user.is_admin;

  try {
    const [totalResults, songs, artists, albums, synths, presets] =
      await Promise.all([
        dbGet(queries.totalResults, Array(5).fill(`%${searchQuery}%`)),
        dbAll(queries.songs, [`%${searchQuery}%`]),
        dbAll(queries.artists, [`%${searchQuery}%`]),
        dbAll(queries.albums, [`%${searchQuery}%`]),
        dbAll(queries.synths, [`%${searchQuery}%`]),
        dbAll(queries.presets, [`%${searchQuery}%`]),
      ]);

    res.render("main/search", {
      isAuth,
      userIsAdmin,
      totalResults: totalResults.total_results,
      songs: songs || [],
      artists: artists || [],
      albums: albums || [],
      synths: synths || [],
      presets: presets || [],
      searchQuery: searchQuery,
      PATH_URL: "search",
    });
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth,
      userIsAdmin,
      PATH_URL: "db-error",
    });
  }
});

module.exports = router;
