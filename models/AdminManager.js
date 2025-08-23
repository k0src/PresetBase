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

  static async #insertSubmissionDataIntoDb(submissionData, submittedAt) {
    const isSingle = submissionData.single === "yes";

    // Insert song
    let song = await DB.get(
      `SELECT id FROM songs WHERE title = ? AND release_year = ?`,
      [submissionData.songTitle, submissionData.songYear]
    );

    const songId = song
      ? song.id
      : await DB.run(
          `INSERT INTO songs (title, genre, release_year, song_url, image_url, timestamp)
             VALUES (?, ?, ?, ?, ?, ?)`,
          [
            submissionData.songTitle,
            submissionData.songGenre,
            submissionData.songYear,
            submissionData.songUrl,
            submissionData.songImg,
            submittedAt,
          ]
        );

    if (!songId) {
      throw new Error(
        "songId is undefined for song: " + submissionData.songTitle
      );
    }

    // Insert album
    let albumId;

    if (!isSingle) {
      const album = await DB.get(
        `SELECT id FROM albums WHERE title = ? AND release_year = ?`,
        [submissionData.albumTitle, submissionData.albumYear]
      );

      albumId = album
        ? album.id
        : await DB.run(
            `INSERT INTO albums (title, genre, release_year, image_url, timestamp)
               VALUES (?, ?, ?, ?, ?)`,
            [
              submissionData.albumTitle,
              submissionData.albumGenre,
              submissionData.albumYear,
              submissionData.albumImg,
              submittedAt,
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
    for (const artist of submissionData.artists) {
      let existingArtist = await DB.get(
        `SELECT id FROM artists WHERE name = ? AND country = ?`,
        [artist.name, artist.country]
      );

      const artistId = existingArtist
        ? existingArtist.id
        : await DB.run(
            `INSERT INTO artists (name, country, image_url, timestamp)
               VALUES (?, ?, ?, ?)`,
            [artist.name, artist.country, artist.img, submittedAt]
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
    for (const synth of submissionData.synths) {
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
              submittedAt,
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
              [preset.name, preset.packName, preset.author, submittedAt]
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
            submittedAt,
          ]
        );

        // add user info
      }
    }

    // Approve files
    if (submissionData.songImg) {
      await AdminManager.#approveFile({
        filename: submissionData.songImg,
        type: "images",
      });
    }

    if (submissionData.albumImg) {
      await AdminManager.#approveFile({
        filename: submissionData.albumImg,
        type: "images",
      });
    }

    for (const artist of submissionData.artists || []) {
      if (artist.img) {
        await AdminManager.#approveFile({
          filename: artist.img,
          type: "images",
        });
      }
    }

    for (const synth of submissionData.synths || []) {
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

      // Add song image if it doesn't exist
      if (!finalSubmissionData.songImg) {
        finalSubmissionData.songImg = finalSubmissionData.albumImg;
      }

      // Add entry to database
      await AdminManager.#insertSubmissionDataIntoDb(
        finalSubmissionData,
        pendingSubmissionId,
        pendingSubmission.submitted_at
      );

      // Delete pending submission
      await DB.run("DELETE FROM pending_submissions WHERE id = ?", [
        pendingSubmissionId,
      ]);

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

  static async #sanitizeSubmissionData(data) {
    try {
      const sanitizedData = structuredClone(data);

      const sanitizeRecursive = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map(sanitizeRecursive);
        } else if (obj !== null && typeof obj === "object") {
          for (const [key, value] of Object.entries(obj)) {
            obj[key] = sanitizeRecursive(value);
          }
          return obj;
        } else if (typeof obj === "string") {
          const trimmed = obj.trim();
          return trimmed;
        }
        return obj;
      };

      return sanitizeRecursive(sanitizedData);
    } catch (err) {
      throw new Error(`Data sanitization failed: ${err.message}`);
    }
  }

  static async #mergeSubmissionDataWithExistingData(data) {
    try {
      const mergedData = structuredClone(data);

      // Merge incoming submission data with existing DB data
      const albumDb = await DB.get(
        `SELECT id, genre, release_year, image_url 
        FROM albums WHERE title = ? AND release_year = ?`,
        [mergedData.albumTitle, mergedData.albumYear]
      );

      if (albumDb) {
        mergedData.albumGenre = albumDb.genre;
        mergedData.albumYear = String(albumDb.release_year);

        if (mergedData.albumImg) {
          if (!albumDb.image_url || mergedData.albumImg !== albumDb.image_url) {
            await AdminManager.#deletePendingFile({
              fileName: mergedData.albumImg,
              type: "images",
            });
          }
          mergedData.albumImg = albumDb.image_url;
        } else if (!mergedData.albumImg) {
          mergedData.albumImg = albumDb.image_url;
        }
        mergedData.albumFilled = true;
      }

      const songDb = await DB.get(
        `SELECT id, genre, release_year, song_url, image_url
        FROM songs WHERE title = ? AND release_year = ?`,
        [mergedData.songTitle, mergedData.songYear]
      );

      if (songDb) {
        mergedData.songGenre = songDb.genre;
        mergedData.songYear = String(songDb.release_year);
        mergedData.songUrl = songDb.song_url;
        mergedData.songFilled = true;

        if (mergedData.songImg) {
          if (!songDb.image_url || mergedData.songImg !== songDb.image_url) {
            await AdminManager.#deletePendingFile({
              fileName: mergedData.songImg,
              type: "images",
            });
          }
          mergedData.songImg = songDb.image_url;
        } else if (!mergedData.songImg) {
          mergedData.songImg = songDb.image_url;
        }
      } else {
        if (
          (!mergedData.songImg || mergedData.songImg.trim() === "") &&
          mergedData.albumImg
        ) {
          mergedData.songImg = mergedData.albumImg;
        }
      }

      for (let i = 0; i < mergedData.artists.length; i++) {
        const artistData = mergedData.artists[i];

        const artistDb = await DB.get(
          `SELECT id, country, image_url
          FROM artists WHERE name = ? AND country = ?`,
          [artistData.name, artistData.country]
        );

        if (artistDb) {
          artistData.country = artistDb.country;

          if (artistData.img) {
            if (!artistDb.image_url || artistData.img !== artistDb.image_url) {
              await AdminManager.#deletePendingFile({
                fileName: artistData.img,
                type: "images",
              });
            }
            artistData.img = artistDb.image_url;
          } else if (!artistData.img) {
            artistData.img = artistDb.image_url;
          }
          artistData.filled = true;
        }
      }

      for (let i = 0; i < mergedData.synths.length; i++) {
        const synthData = mergedData.synths[i];

        const synthDb = await DB.get(
          `SELECT id, manufacturer, synth_type, release_year, image_url
          FROM synths WHERE synth_name = ? AND manufacturer = ?`,
          [synthData.name, synthData.manufacturer]
        );

        if (synthDb) {
          synthData.manufacturer = synthDb.manufacturer;
          synthData.type = synthDb.type;
          synthData.year = String(synthDb.release_year);

          if (synthData.img) {
            if (!synthDb.image_url || synthData.img !== synthDb.image_url) {
              await AdminManager.#deletePendingFile({
                fileName: synthData.img,
                type: "images",
              });
            }
            synthData.img = synthDb.image_url;
          } else if (!synthData.img) {
            synthData.img = synthDb.image_url;
          }
          synthData.filled = true;
        }

        for (let j = 0; j < synthData.presets.length; j++) {
          const presetData = synthData.presets[j];

          const presetDb = await DB.get(
            `SELECT preset_name, pack_name, author
            FROM presets WHERE preset_name = ?`,
            [presetData.name]
          );

          if (presetDb) {
            presetData.packName = presetDb.pack_name;
            presetData.author = presetDb.author;
          } else {
            if (!presetData.packName || presetData.packName.trim() === "") {
              presetData.packName = "Factory";
            }
            if (!presetData.author || presetData.author.trim() === "") {
              presetData.author = synthData.manufacturer;
            }
          }
        }
      }

      return mergedData;
    } catch (err) {
      throw new Error(`Merging submission data failed: ${err.message}`);
    }
  }

  static async uploadEntry({ formData, fileData }) {
    const now = new Date().toISOString();

    const rawData = AdminManager.#attachFileDataToFormData({
      formData,
      fileData,
    });
    try {
      const sanitizedData = await AdminManager.#sanitizeSubmissionData(rawData);
      const fullData = await AdminManager.#mergeSubmissionDataWithExistingData(
        sanitizedData
      );

      await AdminManager.#insertSubmissionDataIntoDb(fullData, now);
    } catch (err) {
      throw new Error(`Error uploading submission: ${err.message}`);
    }
  }
}

module.exports = AdminManager;
