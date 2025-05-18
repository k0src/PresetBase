const express = require("express");
const router = express.Router();
const db = require("../db/db");

// GET /search
router.get("/", async (req, res) => {
  const searchQuery = req.query.query;

  const results = {
    songs: [],
    artists: [],
    albums: [],
    synths: [],
    presets: [],
  };

  const queriesCompleted = [];

  const checkAndRender = () => {
    if (queriesCompleted.length === 5) {
      res.render("search", { query: searchQuery, results });
    }
  };

  // SONGS
  db.all(
    `SELECT title FROM songs WHERE LOWER(title) LIKE ?`,
    [`%${searchQuery}%`],
    (err, rows) => {
      if (!err) results.songs = rows.map((row) => row.title);
      queriesCompleted.push("songs");
      checkAndRender();
    }
  );

  // ARTISTS
  db.all(
    `SELECT name FROM artists WHERE LOWER(name) LIKE ?`,
    [`%${searchQuery}%`],
    (err, rows) => {
      if (!err) results.artists = rows.map((row) => row.name);
      queriesCompleted.push("artists");
      checkAndRender();
    }
  );

  // ALBUMS
  db.all(
    `SELECT title FROM albums WHERE LOWER(title) LIKE ?`,
    [`%${searchQuery}%`],
    (err, rows) => {
      if (!err) results.albums = rows.map((row) => row.title);
      queriesCompleted.push("albums");
      checkAndRender();
    }
  );

  // SYNTHS
  db.all(
    `SELECT synth_name FROM synths WHERE LOWER(synth_name) LIKE ?`,
    [`%${searchQuery}%`],
    (err, rows) => {
      if (!err) results.synths = rows.map((row) => row.synth_name);
      queriesCompleted.push("synths");
      checkAndRender();
    }
  );

  // PRESETS
  db.all(
    `SELECT preset_name FROM presets WHERE LOWER(preset_name) LIKE ?`,
    [`%${searchQuery}%`],
    (err, rows) => {
      if (!err) results.presets = rows.map((row) => row.preset_name);
      queriesCompleted.push("presets");
      checkAndRender();
    }
  );
});

module.exports = router;
