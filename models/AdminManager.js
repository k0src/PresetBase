// Admin Manager model for PresetBase
const DB = require("./DB.js");
const fs = require("fs").promises;
const path = require("path");

class AdminManager {
  static #attachFileDataToFormData({ formData, fileData }) {
    if (!fileData.length) return formData;

    const updated = structuredClone(formData);

    for (const file of fileData) {
      const field = file.fieldname;

      // Directly assign file name if field isn't a list
      if (!field.includes("[") && !field.includes("]")) {
        updated[field] = file.filename;
        continue;
      }

      // Handle list fields like "field[0][file]"
      const pathRegex = /^([a-zA-Z0-9_]+)((?:\[[a-zA-Z0-9_]+\])+)$/;
      const match = field.match(pathRegex);
      if (!match) continue;

      const root = match[1];
      const pathString = match[2];

      // Convert path string to array of keys
      const keys = [
        root,
        ...Array.from(pathString.matchAll(/\[([a-zA-Z0-9_]+)\]/g))
          .map((m) => m[1])
          .map((k) => (/^\d+$/.test(k) ? parseInt(k, 10) : k)),
      ];

      // Traverse or create nested structure
      let target = updated;
      try {
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (target[key] === undefined || target[key] === null) {
            target[key] = typeof keys[i + 1] === "number" ? [] : {};
          }
          target = target[key];
        }

        const lastKey = keys[keys.length - 1];
        target[lastKey] = file.filename;
      } catch (err) {
        console.error(`Could not set file for field ${field}:`, err);
        continue;
      }
    }

    return updated;
  }

  static #mergeDataSets(dataSet1, dataSet2) {
    if (Array.isArray(dataSet1) && Array.isArray(dataSet2)) {
      return dataSet1.map((item, i) =>
        AdminManager.#mergeDataSets(item, dataSet2[i] || {})
      );
    }

    if (typeof dataSet1 === "object" && typeof dataSet2 === "object") {
      const merged = { ...dataSet1 };
      for (const key of Object.keys(dataSet2)) {
        if (dataSet2[key] !== undefined && dataSet2[key] !== "") {
          merged[key] = AdminManager.#mergeDataSets(
            dataSet1[key],
            dataSet2[key]
          );
        }
      }
      return merged;
    }

    return dataSet2 ?? dataSet1;
  }

  static async #approveFile({ filename, type }) {
    const types = ["images", "audio"];
    if (!types.includes(type)) {
      throw new Error(`Invalid file type: ${type}`);
    }

    try {
      const pendingPath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        type,
        "pending",
        filename
      );
      const approvedPath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        type,
        "approved",
        filename
      );

      await fs.rename(pendingPath, approvedPath);
    } catch (err) {
      throw new Error(`Error approving file: ${err.message}`);
    }
  }

  static async #deletePendingFile({ fileName, type }) {
    const types = ["images", "audio"];
    if (!types.includes(type)) {
      throw new Error(`Invalid file type: ${type}`);
    }

    try {
      const filePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        type,
        "pending",
        fileName
      );

      await fs.unlink(filePath);
    } catch (err) {
      throw new Error(`Failed to delete ${fileName}: ${err.message}`);
    }
  }

  static async #deleteUnusedPendingFiles(pendingSubmissionData) {
    try {
      if (pendingSubmissionData.songImg && !pendingSubmissionData.songFilled) {
        await AdminManager.#deletePendingFile({
          fileName: pendingSubmissionData.songImg,
          type: "images",
        });
      }

      if (
        pendingSubmissionData.albumImg &&
        !pendingSubmissionData.albumFilled
      ) {
        await AdminManager.#deletePendingFile({
          fileName: pendingSubmissionData.albumImg,
          type: "images",
        });
      }

      for (const artist of pendingSubmissionData.artists || []) {
        if (artist.img && !artist.filled) {
          await AdminManager.#deletePendingFile({
            fileName: artist.img,
            type: "images",
          });
        }
      }

      for (const synth of pendingSubmissionData.synths || []) {
        if (synth.img && !synth.filled) {
          await AdminManager.#deletePendingFile({
            fileName: synth.img,
            type: "images",
          });
        }

        for (const preset of synth.presets || []) {
          if (preset.audio && !preset.filled) {
            await AdminManager.#deletePendingFile({
              fileName: preset.audio,
              type: "audio",
            });
          }
        }
      }
    } catch (err) {
      throw new Error(`Error deleting unused pending files: ${err.message}`);
    }
  }

  static async approveSubmission({ pendingSubmissionId, formData, fileData }) {
    try {
      console.log(pendingSubmissionId);
      const pendingSubmission = await DB.get(
        "SELECT id, data, submitted_at, user_id FROM pending_submissions WHERE id = ?",
        [pendingSubmissionId]
      );

      if (!pendingSubmission) {
        throw new Error("Pending submission not found");
      }

      // Parse, attach files, and merge data
      pendingSubmission.data = JSON.parse(pendingSubmission.data);
      const rawData = AdminManager.#attachFileDataToFormData({
        formData,
        fileData,
      });
      const finalSubmissionData = AdminManager.#mergeDataSets(
        pendingSubmission.data,
        rawData
      );

      // Add entry to database
      const isSingle = finalSubmissionData.single === "yes";

      // Insert song
      let song = await DB.get(
        `SELECT id FROM songs WHERE title = ? AND release_year = ?`,
        [finalSubmissionData.songTitle, finalSubmissionData.songYear]
      );

      const songId = song
        ? song.id
        : await DB.run(
            `INSERT INTO songs (title, genre, release_year, song_url, image_url, timestamp)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              finalSubmissionData.songTitle,
              finalSubmissionData.songGenre,
              finalSubmissionData.songYear,
              finalSubmissionData.songUrl,
              finalSubmissionData.songImg,
              pendingSubmission.submitted_at,
            ]
          );

      if (!songId) {
        throw new Error(
          "songId is undefined for song: " + finalSubmissionData.songTitle
        );
      }

      // Insert album
      let albumId;

      if (!isSingle) {
        const album = await DB.get(
          `SELECT id FROM albums WHERE title = ? AND release_year = ?`,
          [finalSubmissionData.albumTitle, finalSubmissionData.albumYear]
        );

        albumId = album
          ? album.id
          : await DB.run(
              `INSERT INTO albums (title, genre, release_year, image_url, timestamp)
               VALUES (?, ?, ?, ?, ?)`,
              [
                finalSubmissionData.albumTitle,
                finalSubmissionData.albumGenre,
                finalSubmissionData.albumYear,
                finalSubmissionData.albumImg,
                pendingSubmission.submitted_at,
              ]
            );
      } else {
        albumId = 0;
      }

      await DB.run(
        `INSERT INTO album_songs (song_id, album_id)
         VALUES (?, ?)`,
        [songId, albumId]
      );

      // Insert artists
      for (const artist of finalSubmissionData.artists) {
        let existingArtist = await DB.get(
          `SELECT id FROM artists WHERE name = ? AND country = ?`,
          [artist.name, artist.country]
        );

        const artistId = existingArtist
          ? existingArtist.id
          : await DB.run(
              `INSERT INTO artists (name, country, image_url, timestamp)
               VALUES (?, ?, ?, ?)`,
              [
                artist.name,
                artist.country,
                artist.img,
                pendingSubmission.submitted_at,
              ]
            );

        if (!artistId) {
          throw new Error("artistId is undefined for artist: " + artist.name);
        }

        await DB.run(
          `INSERT INTO song_artists (song_id, artist_id, role)
           VALUES (?, ?, ?)`,
          [songId, artistId, artist.role]
        );
      }

      // Insert synths
      for (const synth of finalSubmissionData.synths) {
        let existingSynth = await DB.get(
          `SELECT id FROM synths WHERE synth_name = ? AND manufacturer = ?`,
          [synth.name, synth.manufacturer]
        );

        const synthId = existingSynth
          ? existingSynth.id
          : await DB.run(
              `INSERT INTO synths 
                (synth_name, manufacturer, synth_type, image_url, release_year, timestamp)
              VALUES (?, ?, ?, ?, ?, ?)`,
              [
                synth.name,
                synth.manufacturer,
                synth.type,
                synth.img,
                synth.year,
                pendingSubmission.submitted_at,
              ]
            );

        if (!synthId) {
          throw new Error("synthId is undefined for synth: " + synth.name);
        }

        // Insert presets
        for (const preset of synth.presets) {
          let existingPreset = await DB.get(
            `SELECT id FROM presets WHERE preset_name = ? AND pack_name = ? AND author = ?`,
            [preset.name, preset.packName, preset.author]
          );

          const presetId = existingPreset
            ? existingPreset.id
            : await DB.run(
                `INSERT INTO presets (preset_name, pack_name, author, timestamp)
                 VALUES (?, ?, ?, ?)`,
                [
                  preset.name,
                  preset.packName,
                  preset.author,
                  pendingSubmission.submitted_at,
                ]
              );

          if (!presetId) {
            throw new Error("presetId is undefined for preset: " + preset.name);
          }

          await DB.run(
            `INSERT INTO preset_synths (preset_id, synth_id)
             VALUES (?, ?)`,
            [presetId, synthId]
          );

          const submissionId = await DB.run(
            `INSERT INTO song_presets
              (song_id, preset_id, usage_type, verified, audio_url, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
              songId,
              presetId,
              preset.usageType,
              "t",
              preset.audio || null,
              pendingSubmission.submitted_at,
            ]
          );

          // add user info
        }
      }

      // Delete pending submission
      await DB.run("DELETE FROM pending_submissions WHERE id = ?", [
        pendingSubmissionId,
      ]);

      // Approve files
      if (finalSubmissionData.songImg) {
        await AdminManager.#approveFile({
          filename: finalSubmissionData.songImg,
          type: "images",
        });
      }

      if (finalSubmissionData.albumImg) {
        await AdminManager.#approveFile({
          filename: finalSubmissionData.albumImg,
          type: "images",
        });
      }

      for (const artist of finalSubmissionData.artists || []) {
        if (artist.img) {
          await AdminManager.#approveFile({
            filename: artist.img,
            type: "images",
          });
        }
      }

      for (const synth of finalSubmissionData.synths || []) {
        if (synth.img) {
          await AdminManager.#approveFile({
            filename: synth.img,
            type: "images",
          });
        }

        for (const preset of synth.presets || []) {
          if (preset.audio) {
            await AdminManager.#approveFile({
              filename: preset.audio,
              type: "audio",
            });
          }
        }
      }

      // Cleanup unused pending files
      await AdminManager.#deleteUnusedPendingFiles(pendingSubmission.data);
    } catch (err) {
      throw new Error(`Error approving submission: ${err.message}`);
    }
  }

  static async denySubmission(pendingSubmissionId) {
    try {
      const pendingSubmission = await DB.get(
        "SELECT id, data FROM pending_submissions WHERE id = ?",
        [pendingSubmissionId]
      );

      if (!pendingSubmission) {
        throw new Error("Pending submission not found");
      }

      pendingSubmission.data = JSON.parse(pendingSubmission.data);

      // Delete unused pending files
      await AdminManager.#deleteUnusedPendingFiles(pendingSubmission.data);

      // Delete pending submission
      await DB.run("DELETE FROM pending_submissions WHERE id = ?", [
        pendingSubmissionId,
      ]);
    } catch (err) {
      throw new Error(`Error denying submission: ${err.message}`);
    }
  }
}

module.exports = AdminManager;
