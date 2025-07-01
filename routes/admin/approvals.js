const express = require("express");
const router = express.Router();
const multer = require("../../middleware/multer.js");
const {
  dbRun,
  dbAll,
  dbGet,
  attachFilesToBody,
  deleteAllPendingFiles,
  approveFile,
  mergeDataSets,
} = require("../../util/UTIL.js");
const isAdmin = require("../../middleware/is-admin.js");
const { getUserById } = require("../../models/user");

/* -------------------------------- Approvals ------------------------------- */
router.get("/", isAdmin, async (req, res) => {
  const isAuth = req.isAuthenticated();
  const query = `SELECT id, data, submitted_at, user_id FROM pending_submissions`;

  try {
    const rows = await dbAll(query);

    const submissions = await Promise.all(
      rows.map(async (row) => {
        const user = await getUserById(row.user_id);
        return {
          id: row.id,
          data: JSON.parse(row.data),
          submittedAt: row.submitted_at,
          username: user.username,
        };
      })
    );

    res.render("admin/approvals", { submissions, isAuth, PATH_URL: "admin" });
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth: req.isAuthenticated(),
      PATH_URL: "db-error",
    });
  }
});

/* ---------------------------- Approve submisson --------------------------- */
router.post("/approve", isAdmin, multer, async (req, res) => {
  try {
    // Get submission data
    const originalEntry = await dbGet(
      `SELECT 
        id, 
        data, 
        submitted_at, 
        user_id 
      FROM pending_submissions WHERE id = ?`,
      [req.body.entryId]
    );

    if (!originalEntry) {
      throw new Error("Submission not found");
    }

    const submissionId = originalEntry.id;
    const submittedTime = originalEntry.submitted_at;

    // Parse data, merge data, attach files
    const originalData = JSON.parse(originalEntry.data);
    const updatedBody = attachFilesToBody(req.body, req.files);
    const finalData = mergeDataSets(originalData, updatedBody);
    const userId = originalEntry.user_id;

    // Add entry to database
    const isSingle = finalData.single === "yes";
    const {
      songTitle,
      songGenre,
      songYear,
      songUrl,
      songImg,
      albumTitle,
      albumGenre,
      albumYear,
      albumImg,
      artists,
      synths,
    } = finalData;

    // Insert song
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

    // Insert album
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

    // Insert artists
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
            [artist.name, artist.country, artist.img, submittedTime]
          );

      if (!artistId)
        throw new Error(
          "artistId is undefined for artist: " + JSON.stringify(artist)
        );

      await dbRun(
        `INSERT INTO song_artists (song_id, artist_id, role)
         VALUES (?, ?, ?)`,
        [songId, artistId, artist.role]
      );
    }

    // Insert Synths
    for (const synth of synths) {
      let existingSynth = await dbGet(
        `SELECT id FROM synths WHERE synth_name = ? AND manufacturer = ?`,
        [synth.name, synth.manufacturer]
      );

      const synthId = existingSynth
        ? existingSynth.id
        : await dbRun(
            `INSERT INTO synths 
              (synth_name, manufacturer, synth_type, 
                release_year, image_url, timestamp)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              synth.name,
              synth.manufacturer,
              synth.type,
              synth.year,
              synth.img,
              submittedTime,
            ]
          );

      // Insert presets
      for (const preset of synth.presets) {
        let existingPreset = await dbGet(
          `SELECT id FROM presets WHERE preset_name = ? AND pack_name = ? AND author = ?`,
          [preset.name, preset.packName, preset.author]
        );

        const presetId = existingPreset
          ? existingPreset.id
          : await dbRun(
              `INSERT INTO presets (preset_name, pack_name, author, timestamp)
                   VALUES (?, ?, ?, ?)`,
              [preset.name, preset.packName, preset.author, submittedTime]
            );

        await dbRun(
          `INSERT INTO preset_synths (preset_id, synth_id)
           VALUES (?, ?)`,
          [presetId, synthId]
        );

        const submissionId = await dbRun(
          `INSERT INTO song_presets 
            (song_id, preset_id, usage_type, verified, audio_url, timestamp)
           VALUES (?, ?, ?, 't', ?, datetime())`,
          [songId, presetId, preset.usageType, preset.audio]
        );

        // add user info
        await dbRun(
          `INSERT INTO user_submissions (user_id, submission_id)
           VALUES (?, ?)`,
          [userId, submissionId]
        );
      }
    }

    // Delete pending submission
    await dbRun(`DELETE FROM pending_submissions WHERE id = ?`, [submissionId]);

    // Approve files
    if (finalData.songImg) {
      await approveFile(finalData.songImg, "images");
    }
    if (finalData.albumImg) {
      await approveFile(finalData.albumImg, "images");
    }
    for (const artist of finalData.artists || []) {
      if (artist.img) {
        await approveFile(artist.img, "images");
      }
    }
    for (const synth of finalData.synths || []) {
      if (synth.img) {
        await approveFile(synth.img, "images");
      }
      for (const preset of synth.presets || []) {
        if (preset.audio) {
          await approveFile(preset.audio, "audio");
        }
      }
    }

    // Then cleanup unused files
    await deleteAllPendingFiles(originalData);

    res.redirect("/admin/approvals");
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth: req.isAuthenticated(),
      PATH_URL: "db-error",
    });
  }
});

/* ----------------------------- Deny submission ---------------------------- */
router.post("/deny/:id", isAdmin, async (req, res) => {
  const id = req.params.id;
  console.log("denying: ", id);

  try {
    const entry = await dbGet(
      `SELECT data FROM pending_submissions WHERE id = ?`,
      [id]
    );

    if (!entry) {
      throw new Error("Submission not found");
    }

    // Delete all pending files
    const data = JSON.parse(entry.data);
    await deleteAllPendingFiles(data);

    await dbRun(`DELETE FROM pending_submissions WHERE id = ?`, [id]);
    res.redirect("/admin/approvals");
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth: req.isAuthenticated(),
      PATH_URL: "db-error",
    });
  }
});

module.exports = router;
