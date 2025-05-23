const express = require("express");
const router = express.Router();
const db = require("../db/db");

// GET /synth/:id
router.get("/:id", (req, res) => {
  const synthId = req.params.id;

  const query = `
        SELECT 
            synths.synth_name,
            synths.manufacturer,
            synths.synth_type,
            synths.release_year,
            synths.image_url,
            presets.id AS preset_id,
            presets.preset_name,
            songs.id AS song_id,
            songs.title AS song_title,
            artists.name AS artist_name,
            song_artists.role AS artist_role,
            song_presets.usage_type
        FROM synths
        LEFT JOIN preset_synths ON synths.id = preset_synths.synth_id
        LEFT JOIN presets ON preset_synths.preset_id = presets.id
        LEFT JOIN song_presets ON presets.id = song_presets.preset_id
        LEFT JOIN songs ON song_presets.song_id = songs.id
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        WHERE synths.id = ?
    `;

  db.all(query, [synthId], (err, rows) => {
    if (err) {
      return res.status(500).send("Database error: " + err.message);
    }

    if (rows.length === 0) {
      return res.status(404).send("Synth not found");
    }

    const synth = {
      name: rows[0].synth_name,
      manufacturer: rows[0].manufacturer,
      type: rows[0].synth_type,
      year: rows[0].release_year,
      image_url: rows[0].image_url,
      presets: {},
    };

    rows.forEach((row) => {
      if (!row.preset_id) return;

      if (!synth.presets[row.preset_id]) {
        synth.presets[row.preset_id] = {
          name: row.preset_name,
          songs: [],
        };
      }

      if (row.song_id && row.artist_role === "Main") {
        synth.presets[row.preset_id].songs.push({
          id: row.song_id,
          title: row.song_title,
          artist: row.artist_name,
          usage_type: row.usage_type,
        });
      }
    });

    res.render("synth", { synth });
  });
});

module.exports = router;
