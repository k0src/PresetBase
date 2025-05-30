const express = require("express");
const router = express.Router();
const db = require("../db/db");

// GET /synth/:id
router.get("/:id", (req, res) => {
  const synthId = req.params.id;
  const now = new Date().toISOString();

  // UPDATE CLICKS + TIMESTAMP
  const updateClick = `
        INSERT INTO synth_clicks (synth_id, clicks, recent_click)
        VALUES (?, 1, ?)
        ON CONFLICT(synth_id)
        DO UPDATE SET
            clicks = clicks + 1,
            recent_click = excluded.recent_click
  `;

  db.run(updateClick, [synthId, now], function (err) {
    if (err) {
      return res.status(500).send("Database error: " + err.message);
    }
  });

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
            albums.title AS album,
            songs.image_url AS song_image_url,
            song_presets.usage_type,
            song_presets.id as song_presets_id,
            (
              SELECT JSON_GROUP_ARRAY(
                JSON_OBJECT(
                  'artist_id', sa2.artist_id,
                  'artist_name', a2.name,
                  'role', sa2.role
                )
              )
              FROM song_artists sa2
              JOIN artists a2 ON sa2.artist_id = a2.id
              WHERE sa2.song_id = songs.id
            ) AS all_artists
 
        FROM synths
        LEFT JOIN preset_synths ON synths.id = preset_synths.synth_id
        LEFT JOIN presets ON preset_synths.preset_id = presets.id
        LEFT JOIN song_presets ON presets.id = song_presets.preset_id
        LEFT JOIN songs ON song_presets.song_id = songs.id
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        LEFT JOIN album_songs ON songs.id = album_songs.song_id
        LEFT JOIN albums ON album_songs.album_id = albums.id
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
      songs: {},
    };

    rows.forEach((row) => {
      let allArtists = [];

      if (row.all_artists) {
        allArtists = JSON.parse(row.all_artists);
      }

      if (!synth.songs[row.song_id]) {
        synth.songs[row.song_id] = {
          id: row.song_id,
          title: row.song_title,
          album: row.album,
          image_url: row.song_image_url,
          all_artists: allArtists,
          presets: [],
        };
      }

      if (
        row.preset_id &&
        row.preset_name &&
        !synth.songs[row.song_id].presets.some((p) => p.id === row.preset_id)
      ) {
        synth.songs[row.song_id].presets.push({
          id: row.preset_id,
          usage_type: row.usage_type,
          name: row.preset_name,
          song_presets_id: row.song_presets_id,
        });
      }
    });

    res.render("synth", { synth });
  });
});

module.exports = router;
