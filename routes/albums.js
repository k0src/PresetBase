const express = require("express");
const router = express.Router();
const db = require("../db/db");

// GET /album/:id
router.get("/:id", (req, res) => {
  const albumId = req.params.id;

  const query = `
        SELECT 
            albums.title AS album_title,
            albums.release_year,
            songs.id AS song_id,
            songs.title AS song_title,
            artists.id AS artist_id,
            artists.name AS artist_name
        FROM albums
        INNER JOIN album_songs ON albums.id = album_songs.album_id
        INNER JOIN songs ON album_songs.song_id = songs.id
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        WHERE albums.id = ?
        ORDER BY songs.id
    `;

  db.all(query, [albumId], (err, rows) => {
    if (err) return res.status(500).send("Database error: " + err.message);
    if (rows.length === 0) return res.status(404).send("Album not found.");

    const album = {
      title: rows[0].album_title,
      year: rows[0].release_year,
      songs: [],
    };

    // Map song_id to song object to avoid duplicates
    const songMap = new Map();

    rows.forEach((row) => {
      if (!songMap.has(row.song_id)) {
        songMap.set(row.song_id, {
          id: row.song_id,
          title: row.song_title,
          artists: [],
        });
      }
      if (row.artist_id) {
        songMap.get(row.song_id).artists.push({
          id: row.artist_id,
          name: row.artist_name,
        });
      }
    });

    album.songs = Array.from(songMap.values());

    res.render("album", { album });
  });
});

module.exports = router;
