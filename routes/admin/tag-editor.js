const express = require("express");
const router = express.Router();
const { dbRun, dbAll, dbGet, getGenreStyles } = require("../../util/UTIL.js");
const isAdmin = require("../../middleware/is-admin.js");

router.get("/", isAdmin, async (req, res) => {
  const query = `
    SELECT id, name, slug, text_color, border_color, bg_color
    FROM genre_tags`;

  try {
    const isAuth = req.isAuthenticated();
    const tags = await dbAll(query);
    const genreStyles = await getGenreStyles();

    res.render("admin/tag-editor", {
      tag: null,
      tags,
      editing: false,
      genreStyles,
      isAuth,
      PATH_URL: "admin",
    });
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth: req.isAuthenticated(),
      PATH_URL: "db-error",
    });
  }
});

router.post("/", isAdmin, async (req, res) => {
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
    return res.status(500).render("static/db-error", {
      err,
      isAuth: req.isAuthenticated(),
      PATH_URL: "db-error",
    });
  }

  res.redirect("/admin/tag-editor?success=1");
});

router.post("/edit-tag", isAdmin, async (req, res) => {
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
    return res.status(500).render("static/db-error", {
      err,
      isAuth: req.isAuthenticated(),
      PATH_URL: "db-error",
    });
  }
});

router.delete("/delete-tag/:tagId", isAdmin, async (req, res) => {
  const tagId = req.params.tagId;

  try {
    await dbRun(`DELETE FROM genre_tags WHERE id = ?`, [tagId]);
    res.status(200).send();
  } catch (err) {
    return res.status(500).send("Error deleting tag: " + err.message);
  }
});

module.exports = router;
