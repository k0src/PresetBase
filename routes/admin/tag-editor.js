const express = require("express");
const router = express.Router();
const { dbRun, dbAll, dbGet, getGenreStyles } = require("../../util/UTIL.js");

/* ----------------------------- Main Admin Page ---------------------------- */
router.get("/tag-editor", async (req, res) => {
  const query = `
    SELECT id, name, slug, text_color, border_color, bg_color
    FROM genre_tags`;

  try {
    const tags = await dbAll(query);
    const genreStyles = await getGenreStyles();

    res.render("admin/tag-editor", {
      tag: null,
      tags,
      editing: false,
      genreStyles,
      PATH_URL: "admin",
    });
  } catch (err) {
    return res
      .status(500)
      .render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

router.post("/tag-editor", async (req, res) => {
  const {
    name,
    slug,
    textColor,
    borderColor,
    backgroundColor,
    editing,
    tagId,
  } = req.body;

  try {
    if (editing === "true") {
      await dbRun(
        `UPDATE genre_tags
         SET name = ?, slug = ?, text_color = ?, border_color = ?, bg_color = ?
         WHERE id = ?`,
        [name, slug, textColor, borderColor, backgroundColor, tagId]
      );
    } else {
      await dbRun(
        `INSERT INTO genre_tags (name, slug, text_color, border_color, bg_color)
         VALUES (?, ?, ?, ?, ?)`,
        [name, slug, textColor, borderColor, backgroundColor]
      );
    }
  } catch (err) {
    return res
      .status(500)
      .render("static/db-error", { err, PATH_URL: "db-error" });
  }

  res.redirect("/admin/tag-editor?success=1");
});

router.post("/tag-editor/delete-tag", async (req, res) => {
  const { tagId } = req.body;

  try {
    await dbRun(`DELETE FROM genre_tags WHERE id = ?`, [tagId]);
  } catch (err) {
    return res
      .status(500)
      .render("static/db-error", { err, PATH_URL: "db-error" });
  }

  res.redirect("/admin/tag-editor");
});

router.post("/tag-editor/edit-tag", async (req, res) => {
  const { tagId } = req.body;

  try {
    const query = `
        SELECT id, name, slug, text_color, border_color, bg_color
        FROM genre_tags`;

    const tags = await dbAll(query);
    const tag = await dbGet(
      `SELECT id, name, slug, text_color, border_color, bg_color
       FROM genre_tags WHERE id = ?`,
      [tagId]
    );

    const genreStyles = await getGenreStyles();

    if (!tag) {
      throw new Error("Tag not found");
    }

    res.render("admin/tag-editor", {
      tag: tag,
      tags,
      editing: true,
      genreStyles,
      PATH_URL: "admin",
    });
  } catch (err) {
    return res
      .status(500)
      .render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

module.exports = router;
