const express = require("express");
const router = express.Router();
const { dbGet } = require("../../util/UTIL.js");

router.get("/", async (req, res) => {
  const announcementQuery = `
    SELECT
        id,
        title,
        description,
        expires_at,
        created_at
    FROM announcements
    WHERE is_active = 1 AND 
        (expires_at IS NULL OR expires_at > ?)
    LIMIT 1`;

  try {
    const isAuth = req.isAuthenticated();
    const announcement = await dbGet(announcementQuery, [
      new Date().toISOString(),
    ]);

    res.render("static/index", {
      announcement,
      isAuth,
      PATH_URL: "home",
    });
  } catch (err) {
    return res
      .status(500)
      .render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

module.exports = router;
