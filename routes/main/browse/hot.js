const express = require("express");
const router = express.Router();
const {
  dbAll,
  convertTimestamps,
  getGenreStyles,
} = require("../../../util/UTIL.js");

router.get("/", async (req, res) => {
  const sortDirections = {
    asc: "ASC",
    desc: "DESC",
  };

  const sortDirection = sortDirections[req.query.direction] || "DESC";

  if (!sortDirection) {
    return res.status(400).send("Invalid sort key");
  }

  const query = `
    WITH hot_songs AS (
      SELECT
          songs.id AS song_id,
          songs.title AS song_title,
          songs.genre AS song_genre,
          songs.release_year AS song_release_year,
          songs.image_url AS song_image,
          MAX(artists.name) AS artist_name,
          MAX(artists.id) AS artist_id,
          MAX(albums.title) AS album_title,
          MAX(albums.id) AS album_id,
          songs.timestamp AS song_added_timestamp,
          COALESCE(MAX(song_clicks.clicks), 0) AS total_clicks,
          COALESCE(MAX(song_clicks.recent_click), 0) AS recent_clicks,
          (
            0.6 * COALESCE(MAX(song_clicks.recent_click), 0) +
            0.3 * COALESCE(MAX(song_clicks.clicks), 0) +
            0.1 * (
              1.0 / NULLIF((julianday('now') - julianday(songs.timestamp)) + 1, 0)
            )
          ) AS hot_score
      FROM songs
      LEFT JOIN song_artists ON songs.id = song_artists.song_id
      LEFT JOIN artists ON song_artists.artist_id = artists.id
      LEFT JOIN album_songs ON songs.id = album_songs.song_id
      LEFT JOIN albums ON album_songs.album_id = albums.id
      LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
      WHERE song_artists.role = 'Main'
      GROUP BY songs.id, songs.title, songs.genre, songs.release_year,
              songs.image_url, songs.timestamp
      ORDER BY hot_score DESC
      LIMIT 10
    )
    SELECT * FROM hot_songs
    ORDER BY hot_score ${sortDirection}`;

  const isAuth = req.isAuthenticated();
  const userIsAdmin = isAuth && req.user && req.user.is_admin;

  try {
    const songs = await dbAll(query);

    convertTimestamps(songs, "song");

    const genreStyles = await getGenreStyles();

    res.render("main/browse/hot", {
      isAuth,
      userIsAdmin,
      songs,
      totalResults: 10,
      genreStyles: genreStyles,
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
