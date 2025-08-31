// Admin Manager model for PresetBase
import DB from "./DB.js";
import fs from "fs/promises";
import path from "path";
import Song from "./Song.js";
import Artist from "./Artist.js";
import Album from "./Album.js";
import Synth from "./Synth.js";
import Preset from "./Preset.js";
import Genre from "./Genre.js";
import dotenv from "dotenv";

dotenv.config();

const UPLOAD_DIR = process.env.UPLOAD_DIR || "public/uploads";

export default class AdminManager {
  static #models = {
    songs: Song,
    artists: Artist,
    albums: Album,
    synths: Synth,
    presets: Preset,
    genres: Genre,
  };

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

  static async #approveFile({ filename, type }) {
    const types = ["images", "audio"];
    if (!types.includes(type)) {
      throw new Error(`Invalid file type: ${type}`);
    }

    try {
      const pendingPath = path.join(UPLOAD_DIR, type, "pending", filename);
      const approvedPath = path.join(UPLOAD_DIR, type, "approved", filename);

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
      const filePath = path.join(UPLOAD_DIR, type, "pending", fileName);
      await fs.unlink(filePath);
    } catch (err) {
      throw new Error(`Failed to delete ${fileName}: ${err.message}`);
    }
  }

  static async #deleteUnusedPendingFiles(submissionData) {
    try {
      const songImgFilled = submissionData.songImgFromAlbum
        ? submissionData.albumFilled
        : submissionData.songFilled;

      if (submissionData.songImg && !songImgFilled) {
        await AdminManager.#deletePendingFile({
          fileName: submissionData.songImg,
          type: "images",
        });
      }

      if (submissionData.albumImg && !submissionData.albumFilled) {
        await AdminManager.#deletePendingFile({
          fileName: submissionData.albumImg,
          type: "images",
        });
      }

      for (const artist of submissionData.artists || []) {
        if (artist.img && !artist.filled) {
          await AdminManager.#deletePendingFile({
            fileName: artist.img,
            type: "images",
          });
        }
      }

      for (const synth of submissionData.synths || []) {
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
      throw new Error(`Error deleting pending files: ${err.message}`);
    }
  }

  static async #deleteReplacedPendingFiles(oldData, newData) {
    try {
      if (
        oldData.songImg &&
        newData.songImg &&
        oldData.songImg !== newData.songImg
      ) {
        await AdminManager.#deletePendingFile({
          fileName: oldData.songImg,
          type: "images",
        });
      }

      if (
        oldData.albumImg &&
        newData.albumImg &&
        oldData.albumImg !== newData.albumImg
      ) {
        await AdminManager.#deletePendingFile({
          fileName: oldData.albumImg,
          type: "images",
        });
      }

      const oldArtistsLength = oldData.artists?.length || 0;
      const newArtistsLength = newData.artists?.length || 0;

      for (let i = 0; i < Math.max(oldArtistsLength, newArtistsLength); i++) {
        const oldArtist = oldData.artists?.[i];
        const newArtist = newData.artists?.[i];

        if (oldArtist?.img) {
          if (
            !newArtist ||
            (newArtist.img && oldArtist.img !== newArtist.img)
          ) {
            await AdminManager.#deletePendingFile({
              fileName: oldArtist.img,
              type: "images",
            });
          }
        }
      }

      const oldSynthsLength = oldData.synths?.length || 0;
      const newSynthsLength = newData.synths?.length || 0;

      for (let i = 0; i < Math.max(oldSynthsLength, newSynthsLength); i++) {
        const oldSynth = oldData.synths?.[i];
        const newSynth = newData.synths?.[i];

        if (oldSynth?.img) {
          if (!newSynth || (newSynth.img && oldSynth.img !== newSynth.img)) {
            await AdminManager.#deletePendingFile({
              fileName: oldSynth.img,
              type: "images",
            });
          }
        }

        if (oldSynth?.presets) {
          for (const oldPreset of oldSynth.presets) {
            if (!oldPreset.audio) continue;

            // Find matching preset in new data by content
            const matchingNewPreset = newSynth?.presets?.find((newPreset) => {
              return (
                newPreset.name === oldPreset.name &&
                newPreset.packName === oldPreset.packName &&
                newPreset.author === oldPreset.author &&
                newPreset.usageType === oldPreset.usageType
              );
            });

            if (!matchingNewPreset) {
              await AdminManager.#deletePendingFile({
                fileName: oldPreset.audio,
                type: "audio",
              });
            } else if (matchingNewPreset.audio !== oldPreset.audio) {
              await AdminManager.#deletePendingFile({
                fileName: oldPreset.audio,
                type: "audio",
              });
            }
          }
        }
      }
    } catch (err) {
      throw new Error(`Error deleting replaced pending files: ${err.message}`);
    }
  }

  static async #insertSubmissionDataIntoDb(submissionData, submittedAt) {
    const isSingle = submissionData.single === "yes";

    // Insert song
    try {
      await DB.beginTransaction();

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
            `SELECT presets.id FROM presets
          INNER JOIN preset_synths ON presets.id = preset_synths.preset_id
          INNER JOIN synths ON preset_synths.synth_id = synths.id
          WHERE preset_name = ? AND pack_name = ? AND author = ? AND synths.id = ?`,
            [preset.name, preset.packName, preset.author, synthId]
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

          if (submissionId) {
            await DB.run(
              `INSERT INTO user_submissions
                (user_id, submission_id)
              VALUES (?, ?)`,
              [submissionData.userId || null, submissionId]
            );
          }
        }
      }

      // Approve files
      const songImgFilled =
        (submissionData.songImgFromAlbum
          ? submissionData.albumFilled
          : submissionData.songFilled) || false;

      if (submissionData.songImg && !songImgFilled) {
        await AdminManager.#approveFile({
          filename: submissionData.songImg,
          type: "images",
        });
      }

      if (
        submissionData.albumImg &&
        !submissionData.albumFilled &&
        !submissionData.songImgFromAlbum
      ) {
        await AdminManager.#approveFile({
          filename: submissionData.albumImg,
          type: "images",
        });
      }

      for (const artist of submissionData.artists || []) {
        if (artist.img && !artist.filled) {
          await AdminManager.#approveFile({
            filename: artist.img,
            type: "images",
          });
        }
      }

      for (const synth of submissionData.synths || []) {
        if (synth.img && !synth.filled) {
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

      await DB.commit();
    } catch (err) {
      await DB.rollback();
      throw new Error(`Error inserting submission data: ${err.message}`);
    }
  }

  static #addFilledInfoToFormData(pendingData, formData) {
    const result = structuredClone(formData);

    if (
      pendingData.songFilled &&
      formData.songImg &&
      pendingData.songImg === formData.songImg
    ) {
      result.songFilled = true;
    }

    if (
      pendingData.songImgFromAlbum &&
      formData.songImg &&
      pendingData.songImg === formData.songImg
    ) {
      result.songImgFromAlbum = true;
    }

    if (
      pendingData.albumFilled &&
      formData.albumImg &&
      pendingData.albumImg === formData.albumImg
    ) {
      result.albumFilled = true;
    }

    if (formData.artists && pendingData.artists) {
      for (let i = 0; i < formData.artists.length; i++) {
        const formArtist = formData.artists[i];
        const pendingArtist = pendingData.artists[i];

        if (
          pendingArtist?.filled &&
          formArtist.img &&
          pendingArtist.img === formArtist.img
        ) {
          result.artists[i].filled = true;
        }
      }
    }

    if (formData.synths && pendingData.synths) {
      for (let i = 0; i < formData.synths.length; i++) {
        const formSynth = formData.synths[i];
        const pendingSynth = pendingData.synths[i];

        if (
          pendingSynth?.filled &&
          formSynth.img &&
          pendingSynth.img === formSynth.img
        ) {
          result.synths[i].filled = true;
        }

        // Handle presets filled status - match by preset content
        if (formSynth.presets && pendingSynth?.presets) {
          for (let j = 0; j < formSynth.presets.length; j++) {
            const formPreset = formSynth.presets[j];
            const matchingPendingPreset = pendingSynth.presets.find(
              (pendingPreset) => {
                const matches =
                  pendingPreset.name === formPreset.name &&
                  pendingPreset.packName === formPreset.packName &&
                  pendingPreset.author === formPreset.author &&
                  pendingPreset.usageType === formPreset.usageType;

                return matches;
              }
            );

            if (
              matchingPendingPreset &&
              matchingPendingPreset.filled &&
              formPreset.audio &&
              matchingPendingPreset.audio === formPreset.audio
            ) {
              result.synths[i].presets[j].filled = true;
            }
          }
        }
      }
    }

    return result;
  }

  static async approveSubmission({ pendingSubmissionId, formData, fileData }) {
    try {
      const pendingSubmission = await DB.get(
        "SELECT id, data, submitted_at, user_id FROM pending_submissions WHERE id = ?",
        [pendingSubmissionId]
      );

      if (!pendingSubmission) {
        throw new Error("Pending submission not found");
      }

      // Parse submission data and add files to form data
      const pendingSubmissionData = JSON.parse(pendingSubmission.data);
      const rawData = AdminManager.#attachFileDataToFormData({
        formData,
        fileData,
      });

      // Add filled info from pending data to form data
      const finalSubmissionData = AdminManager.#addFilledInfoToFormData(
        pendingSubmissionData,
        rawData
      );

      // Delete old pending files that will be replaced
      await AdminManager.#deleteReplacedPendingFiles(
        pendingSubmissionData,
        finalSubmissionData
      );

      console.log(finalSubmissionData);

      // Add entry to database
      await AdminManager.#insertSubmissionDataIntoDb(
        finalSubmissionData,
        pendingSubmission.submitted_at
      );

      // Delete pending submission
      await DB.run("DELETE FROM pending_submissions WHERE id = ?", [
        pendingSubmissionId,
      ]);
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

      const pendingSubmissionData = JSON.parse(pendingSubmission.data);

      // Delete unused pending files
      await AdminManager.#deleteUnusedPendingFiles(pendingSubmissionData);

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
        mergedData.albumFilled = true;

        if (mergedData.albumImg && mergedData.albumImg !== albumDb.image_url) {
          await AdminManager.#deletePendingFile({
            fileName: mergedData.albumImg,
            type: "images",
          });
        }
        mergedData.albumImg = albumDb.image_url;
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

        if (mergedData.songImg && mergedData.songImg !== songDb.image_url) {
          await AdminManager.#deletePendingFile({
            fileName: mergedData.songImg,
            type: "images",
          });
        }
        mergedData.songImg = songDb.image_url;
      } else {
        if (!mergedData.songImg || mergedData.songImg.trim() === "") {
          mergedData.songImg = mergedData.albumImg;
          mergedData.songImgFromAlbum = true;
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
          artistData.filled = true;

          if (artistData.img && artistData.img !== artistDb.image_url) {
            await AdminManager.#deletePendingFile({
              fileName: artistData.img,
              type: "images",
            });
          }
          artistData.img = artistDb.image_url;
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
          synthData.type = synthDb.synth_type;
          synthData.year = String(synthDb.release_year);
          synthData.filled = true;

          if (synthData.img && synthData.img !== synthDb.image_url) {
            await AdminManager.#deletePendingFile({
              fileName: synthData.img,
              type: "images",
            });
          }
          synthData.img = synthDb.image_url;
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
      throw new Error(`Merging entry data failed: ${err.message}`);
    }
  }

  static async uploadEntry({ formData, fileData }) {
    const now = new Date().toISOString();
    try {
      const rawData = AdminManager.#attachFileDataToFormData({
        formData,
        fileData,
      });
      const sanitizedData = await AdminManager.#sanitizeSubmissionData(rawData);
      const fullData = await AdminManager.#mergeSubmissionDataWithExistingData(
        sanitizedData
      );
      await AdminManager.#insertSubmissionDataIntoDb(fullData, now);
    } catch (err) {
      throw new Error(`Error uploading submission: ${err.message}`);
    }
  }

  static async updateEntry({ table, entryId, formData, fileData }) {
    try {
      const Model = AdminManager.#models[table];
      if (!Model) {
        throw new Error(`Invalid table name: ${table}`);
      }

      const rawData = AdminManager.#attachFileDataToFormData({
        formData,
        fileData,
      });
      const sanitizedData = await AdminManager.#sanitizeSubmissionData(rawData);

      await Model.updateById(entryId, sanitizedData);

      if (sanitizedData.imageUrl) {
        await AdminManager.#approveFile({
          filename: sanitizedData.imageUrl,
          type: "images",
        });
      }

      if (sanitizedData.audioUrl) {
        await AdminManager.#approveFile({
          filename: sanitizedData.audioUrl,
          type: "audio",
        });
      }
    } catch (err) {
      throw new Error(
        `Error updating ${table} entry ${entryId}: ${err.message}`
      );
    }
  }

  static async deleteEntry({ table, entryId }) {
    try {
      const Model = AdminManager.#models[table];
      if (!Model) {
        throw new Error(`Invalid table name: ${table}`);
      }

      await Model.deleteById(entryId);
    } catch (err) {
      throw new Error(
        `Error deleting ${table} entry ${entryId}: ${err.message}`
      );
    }
  }

  static async getEntryAutofillData({ table, query, limit }) {
    try {
      const Model = AdminManager.#models[table];
      if (!Model) {
        throw new Error(`Invalid table name: ${table}`);
      }

      const results = await Model.searchForAutofill(query, limit);
      return results;
    } catch (err) {
      throw new Error(`Error fetching ${table} autofill data: ${err.message}`);
    }
  }

  static async getEntryDataById({ table, entryId }) {
    try {
      const Model = AdminManager.#models[table];
      if (!Model) {
        throw new Error(`Invalid table name: ${table}`);
      }

      const entryData = await Model.getFullDataById(entryId);
      if (!entryData) {
        throw new Error(`${table} entry with ID ${entryId} not found`);
      }

      return entryData;
    } catch (err) {
      throw new Error(
        `Error fetching ${table} entry ${entryId} data: ${err.message}`
      );
    }
  }
}
