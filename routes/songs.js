const express = require("express");
const router = express.Router();
const db = require("../db/db");

// GET /song/:id
router.get("/:id", (req, res) => {
  const songId = req.params.id;

  const query = `
        SELECT
            songs.id AS song_id,
            songs.title AS song_title,
            songs.song_url,
            songs.image_url,
            songs.genre AS song_genre,
            songs.release_year AS song_year,
            albums.title AS album_title,
            artists.name AS artist_name,
            song_artists.role AS artist_role,
            presets.preset_name,
            presets.id AS preset_id,
            song_presets.usage_type,
            synths.synth_name,
            artists.id AS artist_id,
            albums.id AS album_id,
            synths.id AS synth_id,
            synths.image_url AS synth_img
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
      id: rows[0].song_id,
      title: rows[0].song_title,
      genre: rows[0].song_genre,
      year: rows[0].song_year,
      album: [rows[0].album_title, rows[0].album_id],
      song_url: rows[0].song_url,
      image_url: rows[0].image_url,
      artists: [],
      presets: [],
    };

    const artistMap = new Map();
    const presetMap = new Map();

    rows.forEach((row) => {
      if (row.artist_name && !artistMap.has(row.artist_name)) {
        artistMap.set(row.artist_name, {
          role: row.artist_role,
          id: row.artist_id,
        });
      }
      if (row.preset_name && !presetMap.has(row.preset_name)) {
        presetMap.set(row.preset_name, {
          usage_type: row.usage_type,
          synth_name: row.synth_name,
          synth_id: row.synth_id,
          synth_img: row.synth_img,
          preset_id: row.preset_id,
        });
      }
    });

    song.artists = Array.from(artistMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => (a.role === "Main" ? -1 : b.role === "Main" ? 1 : 0));
    song.presets = Array.from(presetMap.entries()).map(([name, data]) => ({
      name,
      usage_type: data.usage_type,
      synth_name: data.synth_name,
      synth_id: data.synth_id,
      synth_img: data.synth_img,
      preset_id: data.preset_id,
    }));

    res.render("song", { song });
  });
});

module.exports = router;
