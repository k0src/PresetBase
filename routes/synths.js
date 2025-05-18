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
            presets.id AS preset_id,
            presets.preset_name,
            songs.id AS song_id,
            songs.title AS song_title,
            song_presets.usage_type
        FROM synths
        LEFT JOIN preset_synths ON synths.id = preset_synths.synth_id
        LEFT JOIN presets ON preset_synths.preset_id = presets.id
        LEFT JOIN song_presets ON presets.id = song_presets.preset_id
        LEFT JOIN songs ON song_presets.song_id = songs.id
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

      if (row.song_id) {
        synth.presets[row.preset_id].songs.push({
          id: row.song_id,
          title: row.song_title,
          usage_type: row.usage_type,
        });
      }
    });

    res.render("synth", { synth });
  });
});

module.exports = router;
