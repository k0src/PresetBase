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

  const isAuth = req.isAuthenticated();
  const userIsAdmin = req.user && isAuth && req.user.is_admin;

  try {
    const announcement = await dbGet(announcementQuery, [
      new Date().toISOString(),
    ]);

    res.render("static/index", {
      userIsAdmin,
      isAuth,
      announcement,
      PATH_URL: "home",
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
