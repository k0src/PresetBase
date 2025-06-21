const express = require("express");
const router = express.Router();
const db = require("../../db/db.js");
const { dbRun, dbGet } = require("../../util/UTIL.js");

/* -------------------------------- Approvals ------------------------------- */

router.get("/approvals", (req, res) => {
  const query = `SELECT id, data, submitted_at FROM pending_submissions`;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).send("DB error: " + err.message);

    const submissions = rows.map((row) => ({
      id: row.id,
      data: JSON.parse(row.data),
      submittedAt: row.submitted_at,
    }));

    res.render("admin/approvals", { submissions, PATH_URL: "admin" });
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
    const isSingle = submission.single === "on";

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

    // SONG
    let song = await dbGet(
      `SELECT id FROM songs WHERE title = ? AND song_url = ?`,
      [songTitle, songUrl]
    );

    const songId = song
      ? song.id
      : await dbRun(
          `INSERT INTO songs (title, genre, release_year, song_url, image_url, timestamp)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [songTitle, songGenre, songYear, songUrl, songImg, submittedTime]
        );

    // ALBUM
    let albumId;

    if (!isSingle) {
      const album = await dbGet(
        `SELECT id FROM albums WHERE title = ? AND release_year = ?`,
        [albumTitle, albumYear]
      );

      albumId = album
        ? album.id
        : await dbRun(
            `INSERT INTO albums (title, genre, release_year, image_url, timestamp)
         VALUES (?, ?, ?, ?, ?)`,
            [albumTitle, albumGenre, albumYear, albumImg, submittedTime]
          );
    } else {
      albumId = 0;
    }

    await dbRun(
      `INSERT INTO album_songs (song_id, album_id)
       VALUES (?, ?)`,
      [songId, albumId]
    );

    // ARTISTS
    for (const artist of artists) {
      let existingArtist = await dbGet(
        `SELECT id FROM artists WHERE name = ? AND country = ?`,
        [artist.name, artist.country]
      );

      const artistId = existingArtist
        ? existingArtist.id
        : await dbRun(
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

    // SYNTH
    let synth = await dbGet(
      `SELECT id FROM synths WHERE synth_name = ? AND manufacturer = ?`,
      [synthName, synthMaker]
    );

    const synthId = synth
      ? synth.id
      : await dbRun(
          `INSERT INTO synths (synth_name, manufacturer, synth_type, release_year, image_url, timestamp)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [synthName, synthMaker, synthType, synthYear, synthImg, submittedTime]
        );

    // PRESETS
    for (const preset of presets) {
      let existingPreset = await dbGet(
        `SELECT id FROM presets WHERE preset_name = ? AND pack_name = ? AND author = ?`,
        [preset.name, preset.pack_name, preset.author]
      );

      const presetId = existingPreset
        ? existingPreset.id
        : await dbRun(
            `INSERT INTO presets (preset_name, pack_name, author, timestamp)
             VALUES (?, ?, ?, ?)`,
            [preset.name, preset.pack_name, preset.author, submittedTime]
          );

      await dbRun(
        `INSERT INTO preset_synths (preset_id, synth_id) VALUES (?, ?)`,
        [presetId, synthId]
      );

      await dbRun(
        `INSERT INTO song_presets (song_id, preset_id, usage_type, verified, submitted_by)
         VALUES (?, ?, ?, 't', 'user')`,
        [songId, presetId, preset.usage_type]
      );
    }

    // Remove submission
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
