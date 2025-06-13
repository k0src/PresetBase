const express = require("express");
const router = express.Router();
const {
  dbAll,
  dbGet,
  convertTimestamp,
  moreRecentTimestamp,
} = require("../../UTIL.js");

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
            albums.timestamp AS album_added_timestamp,
            artists.name AS artist_name,
            artists.id AS artist_id
        FROM albums
        LEFT JOIN album_songs ON albums.id = album_songs.album_id
        LEFT JOIN songs ON album_songs.song_id = songs.id
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        WHERE song_artists.role = 'Main' AND albums.title NOT LIKE '[SINGLE]'
        GROUP BY albums.id
        ORDER BY ${sortKey}`,
  };

  try {
    const [totalResults, albums] = await Promise.all([
      dbGet(queries.totalResults),
      dbAll(queries.albums),
    ]);

    if (albums) {
      albums.forEach((album) => {
        album.is_new = moreRecentTimestamp(
          album.album_added_timestamp,
          3 * 24 * 60 * 60 * 1000
        ); // 3 days
        album.album_added_timestamp = convertTimestamp(
          album.album_added_timestamp
        );
      });
    }

    res.render("main/browse/albums", {
      totalResults: totalResults.total_results,
      albums,
      PATH_URL: "browse",
    });
  } catch (err) {
    return res.render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

module.exports = router;
