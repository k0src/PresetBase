const express = require("express");
const router = express.Router();
const multer = require("../../middleware/multer.js");
const {
  dbRun,
  dbGet,
  attachFilesToBody,
  sanitizeData,
  mergeAndValidateSubmitData,
  approveFile,
} = require("../../util/UTIL.js");

/* ------------------------------ Admin Upload ------------------------------ */
router.get("/", async (req, res) => {
  try {
    res.render("admin/upload", {
      success: req.query.success === "1",
      PATH_URL: "admin",
    });
  } catch (err) {
    return res
      .status(500)
      .render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

router.post("/", multer, async (req, res) => {
  try {
    // Parse data
    const rawData = attachFilesToBody(req.body, req.files);
    const sanitizedData = await sanitizeData(rawData);
    const finalData = await mergeAndValidateSubmitData(sanitizedData);

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
           VALUES (?, ?, ?, ?, ?, datetime())`,
          [songTitle, songGenre, songYear, songUrl, songImg]
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
         VALUES (?, ?, ?, ?, datetime())`,
            [albumTitle, albumGenre, albumYear, albumImg]
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
             VALUES (?, ?, ?, datetime())`,
            [artist.name, artist.country, artist.img]
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
             VALUES (?, ?, ?, ?, ?, datetime())`,
            [synth.name, synth.manufacturer, synth.type, synth.year, synth.img]
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
                   VALUES (?, ?, ?, datetime())`,
              [preset.name, preset.packName, preset.author]
            );

        await dbRun(
          `INSERT INTO preset_synths (preset_id, synth_id)
           VALUES (?, ?)`,
          [presetId, synthId]
        );

        await dbRun(
          `INSERT INTO song_presets 
            (song_id, preset_id, usage_type, verified, submitted_by, audio_url, timestamp)
           VALUES (?, ?, ?, 't', 'user', ?, datetime())`,
          [songId, presetId, preset.usageType, preset.audio]
        );
      }
    }

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

    res.redirect("/admin/upload");
  } catch (err) {
    return res
      .status(500)
      .render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

module.exports = router;
