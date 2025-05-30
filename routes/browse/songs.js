const express = require("express");
const router = express.Router();
const db = require("../../db/db");
const { dbAll, dbGet } = require("../UTIL.js");

router.get("/", async (req, res) => {
  const sortKeys = {
    title: "songs.title",
    genre: "songs.genre",
    year: "songs.release_year",
    artist: "artists.name",
    album: "albums.title",
  };

  const sortKey = sortKeys[req.query.sort] || sortKeys["title"];

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
            albums.title AS album_title,
            COALESCE(song_clicks.recent_click, 0) AS recent_click_timestamp,
            COALESCE(song_clicks.clicks, 0) AS clicks,
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

    res.render("browse/songs", {
      totalResults: totalResults.total_results,
      songs,
    });
  } catch (err) {
    return res.status(500).send("Database error: " + err.message);
  }
});

module.exports = router;
