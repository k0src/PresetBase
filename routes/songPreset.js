const express = require("express");
const router = express.Router();
const db = require("../db/db");

// GET /song/:song_id/:preset_id
router.get("/:song_id/:preset_id", (req, res) => {
  const { song_id, preset_id } = req.params;

  const query = `
        SELECT 
            songs.title AS song_title,
            songs.id AS song_id,
            songs.song_url,
            presets.preset_name,
            presets.id AS preset_id,
            synths.synth_name,
            song_presets.usage_type,
            song_presets.timestamp,
            song_presets.demo_video_url,
            song_presets.verified,
            song_presets.submitted_by
        FROM song_presets
        INNER JOIN songs ON song_presets.song_id = songs.id
        INNER JOIN presets ON song_presets.preset_id = presets.id
        INNER JOIN preset_synths ON presets.id = preset_synths.preset_id
        INNER JOIN synths ON preset_synths.synth_id = synths.id
        WHERE songs.id = ? AND presets.id = ?
    `;

  db.get(query, [song_id, preset_id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }

    if (!row) {
      return res.status(404).send("Preset usage not found for this song.");
    }

    res.render("song-preset", { usage: row });
  });
});

module.exports = router;
