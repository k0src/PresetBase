const express = require("express");
const router = express.Router();
const db = require("../../db/db");
const {
  dbAll,
  dbGet,
  convertTimestamp,
  moreRecentTimestamp,
} = require("../UTIL.js");

router.get("/", async (req, res) => {
  const sortKeys = {
    title: "songs.title",
    genre: "songs.genre",
    year: "songs.release_year",
    artist: "artists.name",
    album: "albums.title",
    added: "songs.timestamp",
  };

  const sortKey = sortKeys[req.query.sort] || sortKeys.added;

  if (!sortKey) {
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
            songs.timestamp AS song_added_timestamp
        FROM songs
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        LEFT JOIN album_songs ON songs.id = album_songs.song_id
        LEFT JOIN albums ON album_songs.album_id = albums.id
        LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
        WHERE song_artists.role = 'Main'
        GROUP BY songs.id
        ORDER BY ${sortKey}`,
  };

  try {
    const [totalResults, songs] = await Promise.all([
      dbGet(queries.totalResults),
      dbAll(queries.songs),
    ]);

    if (songs) {
      songs.forEach((song) => {
        song.is_new = moreRecentTimestamp(
          song.song_added_timestamp,
          3 * 24 * 60 * 60 * 1000
        ); // 3 days
        song.song_added_timestamp = convertTimestamp(song.song_added_timestamp);
      });
    }

    res.render("browse/songs", {
      totalResults: totalResults.total_results,
      songs,
      PATH_URL: "browse",
    });
  } catch (err) {
    return res.status(500).send("Database error: " + err.message);
  }
});

module.exports = router;
