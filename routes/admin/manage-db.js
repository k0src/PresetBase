const express = require("express");
const router = express.Router();
const isAdmin = require("../../middleware/is-admin.js");
const { dbAll, dbGet } = require("../../util/UTIL.js");

router.get("/", isAdmin, async (req, res) => {
  const isAuth = req.isAuthenticated();
  const userIsAdmin = req.user && req.user.is_admin;

  // Load songs table initally - most important
  const queries = {
    songsData: `
      SELECT
        id AS song_id,
        title AS song_title,
        genre AS song_genre,
        release_year AS song_year,
        song_url,
        image_url AS song_image,
        timestamp AS song_timestamp
      FROM songs
      ORDER BY id ASC`,

    totalTables: `
      SELECT COUNT(*) AS total_tables
      FROM sqlite_master
      WHERE type = 'table'
        AND name NOT LIKE 'sqlite_%';`,
  };

  try {
    const [songsData, totalTables] = await Promise.all([
      dbAll(queries.songsData),
      dbGet(queries.totalTables),
    ]);

    res.render("admin/manage-db", {
      isAuth,
      userIsAdmin,
      songsData,
      totalTables,
      PATH_URL: "admin",
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
