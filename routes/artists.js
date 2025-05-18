const express = require("express");
const router = express.Router();
const db = require("../db/db");

// GET /artist/:id
router.get("/:id", (req, res) => {
  const artistId = req.params.id;

  const query = `
        SELECT 
            artists.name AS artist_name,
            artists.country,
            songs.id AS song_id,
            songs.title AS song_title,
            song_artists.role
        FROM artists
        LEFT JOIN song_artists ON artists.id = song_artists.artist_id
        LEFT JOIN songs ON song_artists.song_id = songs.id
        WHERE artists.id = ?
    `;

  db.all(query, [artistId], (err, rows) => {
    if (err) {
      return res.status(500).send("Database error: " + err.message);
    }

    if (rows.length === 0) {
      return res.status(404).send("Artist not found");
    }

    const artist = {
      name: rows[0].artist_name,
      country: rows[0].country,
      songs: [],
    };

    rows.forEach((row) => {
      if (row.song_id) {
        artist.songs.push({
          id: row.song_id,
          title: row.song_title,
          role: row.role,
        });
      }
    });

    res.render("artist", { artist });
  });
});

module.exports = router;
