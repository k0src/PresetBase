const express = require("express");
const router = express.Router();
const {
  dbAll,
  dbGet,
  convertTimestamps,
  markNew,
  markHot,
} = require("../../../util/UTIL.js");

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
            artists.timestamp AS artist_added_timestamp,
            COALESCE(artist_clicks.recent_click, 0) AS artist_recent_click
        FROM artists
        LEFT JOIN artist_clicks ON artist_clicks.artist_id = artists.id
        ORDER BY ${sortKey}`,

    hotArtists: `
      SELECT
          artists.id AS artist_id,
          COALESCE(artist_clicks.recent_click, 0) AS recent_click
      FROM artists
      LEFT JOIN artist_clicks ON artist_clicks.artist_id = artists.id
      ORDER BY artist_clicks.recent_click DESC
      LIMIT 10`,
  };

  const isAuth = req.isAuthenticated();
  const userIsAdmin = isAuth && req.user && req.user.is_admin;

  try {
    const [totalResults, artists, hotArtists] = await Promise.all([
      dbGet(queries.totalResults),
      dbAll(queries.artists),
      dbAll(queries.hotArtists),
    ]);

    markNew(artists, "artist");
    markHot(artists, hotArtists, "artist");
    convertTimestamps(artists, "artist");

    res.render("main/browse/artists", {
      isAuth,
      userIsAdmin,
      totalResults: totalResults.total_results,
      artists,
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
