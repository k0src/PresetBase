const express = require("express");
const router = express.Router();
const { dbRun, dbAll, dbGet } = require("../../util/UTIL.js");

/* ----------------------------- Main Admin Page ---------------------------- */
router.get("/tag-editor", async (req, res) => {
  try {
    res.render("admin/tag-editor", { PATH_URL: "admin" });
  } catch (err) {
    return res.render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

router.post("/tag-editor", async (req, res) => {
  const { name, slug, textColor, borderColor, backgroundColor } = req.body;

  try {
    await dbRun(
      `INSERT INTO genre_tags (name, slug, text_color, border_color, bg_color)
         VALUES (?, ?, ?, ?, ?)`,
      [name, slug, textColor, borderColor, backgroundColor]
    );
  } catch (err) {
    return res.render("static/db-error", { err, PATH_URL: "db-error" });
  }

  res.redirect("/admin/tag-editor?success=1");
});

module.exports = router;
