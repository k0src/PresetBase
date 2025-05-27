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
    totalResults: 0,
  };

  const queriesCompleted = [];

  const checkAndRender = () => {
    if (queriesCompleted.length === 5) {
      res.render("search", { query: searchQuery, results });
    }
  };

  // SONGS
  db.all(
    `
    SELECT s.id, s.title, s.genre, s.image_url, a.name AS artist, al.title AS album
    FROM songs s
    LEFT JOIN song_artists sa ON s.id = sa.song_id
    LEFT JOIN artists a ON sa.artist_id = a.id
    LEFT JOIN album_songs als ON s.id = als.song_id
    LEFT JOIN albums al ON als.album_id = al.id
    WHERE sa.role = 'Main' AND LOWER(s.title) LIKE ?
    GROUP BY s.id
  `,
    [`%${searchQuery}%`],
    (err, rows) => {
      if (!err) results.songs = rows;
      queriesCompleted.push("songs");
      checkAndRender();
    }
  );

  // ARTISTS
  db.all(
    `
    SELECT id, name, country, image_url FROM artists
    WHERE LOWER(name) LIKE ?
  `,
    [`%${searchQuery}%`],
    (err, rows) => {
      if (!err) results.artists = rows;
      queriesCompleted.push("artists");
      checkAndRender();
    }
  );

  // ALBUMS
  db.all(
    `
    SELECT al.id, al.title, al.genre, al.image_url, a.name AS artist
    FROM albums al
    LEFT JOIN album_songs als ON al.id = als.album_id
    LEFT JOIN songs s ON s.id = als.song_id
    LEFT JOIN song_artists sa ON s.id = sa.song_id
    LEFT JOIN artists a ON sa.artist_id = a.id
    WHERE LOWER(al.title) LIKE ?
    GROUP BY al.id
  `,
    [`%${searchQuery}%`],
    (err, rows) => {
      if (!err) results.albums = rows;
      queriesCompleted.push("albums");
      checkAndRender();
    }
  );

  // SYNTHS
  db.all(
    `
    SELECT id, synth_name, manufacturer, image_url, synth_type FROM synths
    WHERE LOWER(synth_name) LIKE ?
  `,
    [`%${searchQuery}%`],
    (err, rows) => {
      if (!err) results.synths = rows;
      queriesCompleted.push("synths");
      checkAndRender();
    }
  );

  // PRESETS
  db.all(
    `
    SELECT p.id, p.preset_name, p.author, s.synth_name, s.image_url, s.id AS synth_id
    FROM presets p
    LEFT JOIN preset_synths ps ON p.id = ps.preset_id
    LEFT JOIN synths s ON s.id = ps.synth_id
    WHERE LOWER(p.preset_name) LIKE ?
  `,
    [`%${searchQuery}%`],
    (err, rows) => {
      if (!err) results.presets = rows;
      queriesCompleted.push("presets");
      checkAndRender();
    }
  );
});

module.exports = router;
