const express = require("express");
const router = express.Router();
const { dbAll, dbGet } = require("../../../util/UTIL.js");

router.get("/", async (req, res) => {
  const sortKeys = {
    genre: "genre",
    songs: "num_songs DESC",
    none: "NULL",
  };

  const sortDirections = {
    asc: "ASC",
    desc: "DESC",
  };

  const sortKey = sortKeys[req.query.sort] || sortKeys.none;
  const sortDirection = sortDirections[req.query.direction] || "ASC";

  if (!sortKey || !sortDirection) {
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
        GROUP BY genre
        ORDER BY ${sortKey} ${sortDirection}`,
  };

  const isAuth = req.isAuthenticated();
  const userIsAdmin = isAuth && req.user && req.user.is_admin;

  try {
    const [totalResults, genres] = await Promise.all([
      dbGet(queries.totalResults),
      dbAll(queries.genres),
    ]);

    res.render("main/browse/genres", {
      isAuth,
      userIsAdmin,
      genres,
      totalResults: totalResults.total_results,
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
