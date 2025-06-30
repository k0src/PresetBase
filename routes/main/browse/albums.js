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
    title: "albums.title",
    genre: "albums.genre",
    year: "albums.release_year",
    artist: "artists.name",
    added: "albums.timestamp",
  };

  const sortKey = sortKeys[req.query.sort] || sortKeys.added;

  if (!sortKey) {
    return res.status(400).send("Invalid sort key");
  }

  const queries = {
    totalResults: `
        SELECT COUNT(*) AS total_results FROM albums`,

    albums: `
        SELECT
            albums.id AS album_id,
            albums.title AS album_title,
            albums.genre AS album_genre,
            albums.release_year AS album_release_year,
            albums.image_url AS album_image,
            artists.name AS artist_name,
            artists.id AS artist_id,
            albums.timestamp AS album_added_timestamp
        FROM albums
        LEFT JOIN album_songs ON albums.id = album_songs.album_id
        LEFT JOIN songs ON album_songs.song_id = songs.id
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        LEFT JOIN album_clicks ON album_clicks.album_id = albums.id
        WHERE song_artists.role = 'Main' AND albums.title NOT LIKE '[SINGLE]'
        GROUP BY albums.id
        ORDER BY ${sortKey}`,

    hotAlbums: `
      SELECT
          albums.id AS album_id,
          COALESCE(album_clicks.recent_click, 0) AS recent_click
      FROM albums
      LEFT JOIN album_clicks ON album_clicks.album_id = albums.id
      ORDER BY album_clicks.recent_click DESC
      LIMIT 10`,
  };

  try {
    const isAuth = req.isAuthenticated();
    const [totalResults, albums, hotAlbums] = await Promise.all([
      dbGet(queries.totalResults),
      dbAll(queries.albums),
      dbAll(queries.hotAlbums),
    ]);

    markNew(albums, "album");
    markHot(albums, hotAlbums, "album");
    convertTimestamps(albums, "album");

    const genreStyles = await getGenreStyles();

    res.render("main/browse/albums", {
      totalResults: totalResults.total_results,
      albums,
      genreStyles,
      isAuth,
      PATH_URL: "browse",
    });
  } catch (err) {
    return res
      .status(500)
      .render("static/db-error", {
        err,
        isAuth: req.isAuthenticated(),
        PATH_URL: "db-error",
      });
  }
});

module.exports = router;
