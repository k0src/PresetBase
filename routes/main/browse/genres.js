const express = require("express");
const router = express.Router();
const { dbAll, dbGet } = require("../../UTIL.js");

router.get("/", async (req, res) => {
  const sortKeys = {
    genre: "genre",
    songs: "num_songs DESC",
    none: "NULL",
  };

  const sortKey = sortKeys[req.query.sort] || sortKeys.none;

  if (!sortKey) {
    return res.status(400).send("Invalid sort key");
  }

  const queries = {
    totalResults: `
        SELECT
            COUNT(DISTINCT songs.genre) as total_results 
        FROM songs`,

    genres: `
        SELECT
            genre,
            MAX(songs.image_url) AS song_image,
            COUNT(*) AS num_songs
        FROM songs
        LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
        GROUP BY genre
        ORDER BY ${sortKey}`,
  };

  try {
    const [totalResults, genres] = await Promise.all([
      dbGet(queries.totalResults),
      dbAll(queries.genres),
    ]);

    res.render("main/browse/genres", {
      genres,
      totalResults: totalResults.total_results,
      PATH_URL: "browse",
    });
  } catch (err) {
    return res.render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

module.exports = router;
