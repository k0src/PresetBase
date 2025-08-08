// User Submission Manager model for PresetBase
const DB = require("./DB.js");
const fs = require("fs").promises;
const path = require("path");

class UserSubmissionManager {
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

  static async #mergeSubmissionDataWithExistingData(data) {
    try {
      const mergedData = structuredClone(data);

      // Merge incoming submission data with existing DB data
      const albumDb = await DB.get(
        `SELECT id, genre, release_year, image_url 
        FROM albums WHERE title = ? AND release_year = ?`,
        [mergedData.album.title, mergedData.album.year]
      );

      if (albumDb) {
        mergedData.album.genre = albumDb.genre;
        mergedData.album.year = String(albumDb.release_year);

        if (mergedData.album.imageUrl) {
          mergedData.album.imageUrl = albumDb.image_url;
          await UserSubmissionManager.#deletePendingFile({
            fileName: mergedData.album.imageUrl,
            type: "images",
          });
        } else if (!mergedData.album.imageUrl) {
          mergedData.album.imageUrl = albumDb.image_url;
        }
        mergedData.album.filled = true;
      }

      const songDb = await DB.get(
        `SELECT id, genre, release_year, song_url, image_url
        FROM songs WHERE title = ? AND release_year = ?`,
        [mergedData.song.title, mergedData.song.year]
      );

      if (songDb) {
        mergedData.song.genre = songDb.genre;
        mergedData.song.year = String(songDb.release_year);
        mergedData.song.songUrl = songDb.song_url;

        if (mergedData.song.imageUrl) {
          mergedData.song.imageUrl = songDb.image_url;
          await UserSubmissionManager.#deletePendingFile({
            fileName: mergedData.song.imageUrl,
            type: "images",
          });
        } else if (!mergedData.song.imageUrl) {
          mergedData.song.imageUrl = songDb.image_url;
        }
      } else {
        if (
          (!mergedData.song.imageUrl ||
            mergedData.song.imageUrl.trim() === "") &&
          mergedData.album.imageUrl
        ) {
          mergedData.song.imageUrl = mergedData.album.imageUrl;
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

          if (artistData.imageUrl) {
            artistData.imageUrl = artistDb.image_url;
            await UserSubmissionManager.#deletePendingFile({
              fileName: artistData.imageUrl,
              type: "images",
            });
          } else if (!artistData.imageUrl) {
            artistData.imageUrl = artistDb.image_url;
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

          if (synthData.imageUrl) {
            synthData.imageUrl = synthDb.image_url;
            await UserSubmissionManager.#deletePendingFile({
              fileName: synthData.imageUrl,
              type: "images",
            });
          } else if (!synthData.imageUrl) {
            synthData.imageUrl = synthDb.image_url;
          }
          synthData.filled = true;
        }

        for (let j = 0; j < synths.presets.length; j++) {
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

  static async processSubmission({ formData, fileData }) {
    const userId = formData.userId;
    const now = new Date().toISOString();

    const rawData = UserSubmissionManager.#attachFileDataToFormData({
      formData,
      fileData,
    });
    try {
      const sanitizedData = await UserSubmissionManager.#sanitizeSubmissionData(
        rawData
      );
      const fullData =
        await UserSubmissionManager.#mergeSubmissionDataWithExistingData(
          sanitizedData
        );
      const pendingSubmissionData = JSON.stringify(fullData);

      await DB.run(
        `INSERT INTO pending_submissions 
          (data, submitted_at, user_id) 
        VALUES (?, ?, ?)`,
        [pendingSubmissionData, now, userId]
      );
    } catch (err) {
      throw new Error(`Submission processing failed: ${err.message}`);
    }
  }
}

module.exports = UserSubmissionManager;
