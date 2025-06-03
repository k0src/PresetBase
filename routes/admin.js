const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { dbRun, dbGet } = require("./UTIL.js");

/* -------------------------------- Approvals ------------------------------- */

router.get("/approvals", (req, res) => {
  const query = `SELECT id, data FROM pending_submissions`;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).send("DB error: " + err.message);

    const submissions = rows.map((row) => ({
      id: row.id,
      data: JSON.parse(row.data),
    }));

    res.render("approvals", { submissions });
  });
});

/* ---------------------------- Approve submisson --------------------------- */

router.post("/approve/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const row = await dbGet(
      `SELECT data, submitted_at FROM pending_submissions WHERE id = ?`,
      [id]
    );

    if (!row) return res.status(404).send("Submission not found");

    const { submitted_at: submittedTime, data } = row;
    const submission = JSON.parse(data);

    const {
      songTitle,
      songGenre,
      songYear,
      songUrl,
      songImg,
      artists,
      albumTitle,
      albumGenre,
      albumYear,
      albumImg,
      synthName,
      synthMaker,
      synthYear,
      synthType,
      synthImg,
      presets,
    } = submission;

    const songId = await dbRun(
      `INSERT INTO songs (title, genre, release_year, song_url, image_url, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [songTitle, songGenre, songYear, songUrl, songImg, submittedTime]
    );

    const albumId = await dbRun(
      `INSERT INTO albums (title, genre, release_year, image_url, timestamp) 
       VALUES (?, ?, ?, ?, ?)`,
      [albumTitle, albumGenre, albumYear, albumImg, submittedTime]
    );

    await dbRun(
      `INSERT INTO album_songs (song_id, album_id)
       VALUES (?, ?)`,
      [songId, albumId]
    );

    for (const artist of artists) {
      const artistId = await dbRun(
        `INSERT INTO artists (name, country, image_url, timestamp)
         VALUES (?, ?, ?, ?)`,
        [artist.name, artist.country, artist.image_url, submittedTime]
      );
      await dbRun(
        `INSERT INTO song_artists (song_id, artist_id, role)
         VALUES (?, ?, ?)`,
        [songId, artistId, artist.role]
      );
    }

    const synthId = await dbRun(
      `INSERT INTO synths (synth_name, manufacturer, synth_type, release_year, image_url, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [synthName, synthMaker, synthType, synthYear, synthImg, submittedTime]
    );

    for (const preset of presets) {
      const presetId = await dbRun(
        `INSERT INTO presets (preset_name, pack_name, author, timestamp)
         VALUES (?, ?, ?, ?)`,
        [preset.name, preset.pack_name, preset.author, submittedTime]
      );

      await dbRun(
        `INSERT INTO preset_synths (preset_id, synth_id)
         VALUES (?, ?)`,
        [presetId, synthId]
      );

      await dbRun(
        `INSERT INTO song_presets (song_id, preset_id, usage_type, verified, submitted_by)
         VALUES (?, ?, ?, 't', 'user')`,
        [songId, presetId, preset.usage_type]
      );
    }

    await dbRun(`DELETE FROM pending_submissions WHERE id = ?`, [id]);

    res.redirect("/admin/approvals");
  } catch (err) {
    res.status(500).send("Server error: " + err.message);
  }
});

/* ----------------------------- Deny submission ---------------------------- */

router.post("/deny/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await dbRun(`DELETE FROM pending_submissions WHERE id = ?`, [id]);
    res.redirect("/admin/approvals");
  } catch (err) {
    res.status(500).send("Database error: " + err.message);
  }
});

module.exports = router;
