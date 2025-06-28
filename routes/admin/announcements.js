const express = require("express");
const router = express.Router();
const { dbRun, dbAll, dbGet } = require("../../util/UTIL.js");

router.get("/", async (req, res) => {
  const queries = {
    announcements: `
        SELECT 
          id,
          title,
          description,
          expires_at,
          created_at 
        FROM announcements
        WHERE is_active != 1
        ORDER BY created_at DESC`,

    activeAnnouncement: `
        SELECT
            id,
            title,
            description,
            expires_at,
            created_at
        FROM announcements
        WHERE is_active = 1 AND 
            (expires_at IS NULL OR expires_at > datetime('now'))
        LIMIT 1`,
  };

  try {
    const announcements = await dbAll(queries.announcements);
    const activeAnnouncement = await dbGet(queries.activeAnnouncement);

    res.render("admin/announcements", {
      announcements: announcements,
      activeAnnouncement: activeAnnouncement,
      PATH_URL: "admin",
    });
  } catch (err) {
    return res
      .status(500)
      .render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

router.post("/", async (req, res) => {
  const { title, description, expires_at } = req.body;
  const utcDateTime = new Date(expires_at).toISOString();
  const now = new Date().toISOString();

  try {
    // Set other announcement to inactive
    await dbRun(`UPDATE announcements SET is_active = 0 WHERE is_active = 1`);

    // Add announcement, set active
    await dbRun(
      `INSERT INTO announcements 
        (title, description, is_active, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)`,
      [title, description, 1, utcDateTime, now]
    );
    res.status(200).send();
  } catch (err) {
    return res
      .status(500)
      .render("static/db-error", { err, PATH_URL: "db-error" });
  }
  res.redirect("/admin/announcements?success=1");
});

router.post("/deactivate-announcement/:announcementId", async (req, res) => {
  const announcementId = req.params.announcementId;

  try {
    await dbRun(
      `UPDATE announcements
      SET is_active = 0
      WHERE id = ?`,
      [announcementId]
    );
    res.status(200).send();
  } catch (err) {
    return res
      .status(500)
      .send("Error deactivating announcement: " + err.message);
  }
  res.redirect("/admin/announcements?success=1");
});

module.exports = router;
