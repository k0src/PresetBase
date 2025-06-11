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
    name: "artists.name",
    country: "artists.country",
    added: "artists.timestamp",
  };

  const sortKey = sortKeys[req.query.sort] || sortKeys.added;

  if (!sortKey) {
    return res.status(400).send("Invalid sort key");
  }

  const queries = {
    totalResults: `
        SELECT COUNT(*) AS total_results FROM artists`,

    artists: `
        SELECT
            artists.name AS artist_name,
            artists.id AS artist_id,
            artists.country AS artist_country,
            artists.image_url AS artist_image,
            artists.timestamp AS artist_added_timestamp
        FROM artists
        ORDER BY ${sortKey}`,
  };

  try {
    const [totalResults, artists] = await Promise.all([
      dbGet(queries.totalResults),
      dbAll(queries.artists),
    ]);

    if (artists) {
      artists.forEach((artist) => {
        artist.is_new = moreRecentTimestamp(
          artist.artist_added_timestamp,
          3 * 24 * 60 * 60 * 1000
        ); // 3 days
        artist.artist_added_timestamp = convertTimestamp(
          artist.artist_added_timestamp
        );
      });
    }

    res.render("main/browse/artists", {
      totalResults: totalResults.total_results,
      artists,
      PATH_URL: "browse",
    });
  } catch (err) {
    return res.status(500).send("Database error: " + err.message);
  }
});

module.exports = router;
