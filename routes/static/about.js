const express = require("express");
const router = express.Router();
const { dbGet } = require("../../util/UTIL.js");

router.get("/", async (req, res) => {
  const query = `
      SELECT
        (SELECT COUNT(*) FROM songs) AS total_songs,
        (SELECT COUNT(*) FROM albums) AS total_albums,
        (SELECT COUNT(*) FROM artists) AS total_artists,
        (SELECT COUNT(*) FROM synths) AS total_synths,
        (SELECT COUNT(*) FROM presets) AS total_presets`;

  const isAuth = req.isAuthenticated();
  const userIsAdmin = isAuth && req.user && req.user.is_admin;
  try {
    const dbStats = await dbGet(query);

    res.render("static/about", {
      isAuth,
      userIsAdmin,
      dbStats,
      PATH_URL: "about",
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
