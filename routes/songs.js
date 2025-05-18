const express = require("express");
const router = express.Router();
const db = require("../db/db");

// GET /song/:id
router.get("/:id", (req, res) => {
  const songId = req.params.id;

  const query = `
        SELECT 
            songs.title AS song_title,
            songs.genre AS song_genre,
            songs.release_year AS song_year,
            albums.title AS album_title,
            artists.name AS artist_name,
            song_artists.role AS artist_role,
            presets.preset_name,
            song_presets.usage_type,
            synths.synth_name
        FROM songs
        LEFT JOIN album_songs ON songs.id = album_songs.song_id
        LEFT JOIN albums ON album_songs.album_id = albums.id
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        LEFT JOIN song_presets ON songs.id = song_presets.song_id
        LEFT JOIN presets ON song_presets.preset_id = presets.id
        LEFT JOIN preset_synths ON presets.id = preset_synths.preset_id
        LEFT JOIN synths ON preset_synths.synth_id = synths.id
        WHERE songs.id = ?
    `;

  db.all(query, [songId], (err, rows) => {
    if (err) {
      return res.status(500).send("Database error: " + err.message);
    }

    if (rows.length === 0) {
      return res.status(404).send("Song not found");
    }

    const song = {
      title: rows[0].song_title,
      genre: rows[0].song_genre,
      year: rows[0].song_year,
      albums: [...new Set(rows.map((r) => r.album_title))],
      artists: [],
      presets: [],
    };

    const artistMap = new Map();
    const presetMap = new Map();

    rows.forEach((row) => {
      if (row.artist_name && !artistMap.has(row.artist_name)) {
        artistMap.set(row.artist_name, row.artist_role);
      }
      if (row.preset_name && !presetMap.has(row.preset_name)) {
        presetMap.set(row.preset_name, {
          usage_type: row.usage_type,
          synth_name: row.synth_name,
        });
      }
    });

    song.artists = Array.from(artistMap.entries()).map(([name, role]) => ({
      name,
      role,
    }));
    song.presets = Array.from(presetMap.entries()).map(([name, data]) => ({
      name,
      usage_type: data.usage_type,
      synth_name: data.synth_name,
    }));

    res.render("song", { song });
  });
});

module.exports = router;
