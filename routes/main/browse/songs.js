const express = require("express");
const router = express.Router();
const {
  dbAll,
  dbGet,
  convertTimestamps,
  markNew,
  markHot,
  getGenreStyles,
} = require("../../../util/UTIL.js");

router.get("/", async (req, res) => {
  const sortKeys = {
    title: "songs.title",
    genre: "songs.genre",
    year: "songs.release_year",
    artist: "artists.name",
    album: "albums.title",
    added: "songs.timestamp",
  };

  const sortDirections = {
    asc: "ASC",
    desc: "DESC",
  };

  const sortKey = sortKeys[req.query.sort] || sortKeys.added;
  const sortDirection = sortDirections[req.query.direction] || "ASC";

  if (!sortKey || !sortDirection) {
    return res.status(400).send("Invalid sort key");
  }

  const queries = {
    totalResults: `
        SELECT COUNT(*) AS total_results FROM songs`,

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
            albums.id AS album_id,
            songs.timestamp AS song_added_timestamp,
            COALESCE(song_clicks.recent_click, 0) AS song_recent_click
        FROM songs
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        LEFT JOIN album_songs ON songs.id = album_songs.song_id
        LEFT JOIN albums ON album_songs.album_id = albums.id
        LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
        WHERE song_artists.role = 'Main'
        GROUP BY songs.id
        ORDER BY ${sortKey} ${sortDirection}`,

    hotSongs: `
      SELECT
          songs.id AS song_id,
          COALESCE(song_clicks.recent_click, 0) AS recent_click
      FROM songs
      LEFT JOIN song_clicks ON song_clicks.song_id = songs.id
      ORDER BY song_clicks.recent_click DESC
      LIMIT 10`,
  };

  const isAuth = req.isAuthenticated();
  const userIsAdmin = isAuth && req.user && req.user.is_admin;

  try {
    const [totalResults, songs, hotSongs] = await Promise.all([
      dbGet(queries.totalResults),
      dbAll(queries.songs),
      dbAll(queries.hotSongs),
    ]);

    markNew(songs, "song");
    markHot(songs, hotSongs, "song");
    convertTimestamps(songs, "song");

    const genreStyles = await getGenreStyles();

    res.render("main/browse/songs", {
      isAuth,
      userIsAdmin,
      totalResults: totalResults.total_results,
      songs,
      genreStyles,
      PATH_URL: "browse",
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
