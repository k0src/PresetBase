// User Submission Manager model for PresetBase
import DB from "./DB.js";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const UPLOAD_DIR = process.env.UPLOAD_DIR || "public/uploads";

export default class UserSubmissionManager {
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
      const filePath = path.join(UPLOAD_DIR, type, "pending", fileName);
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
        [mergedData.albumTitle, mergedData.albumYear]
      );

      if (albumDb) {
        mergedData.albumGenre = albumDb.genre;
        mergedData.albumYear = String(albumDb.release_year);
        mergedData.albumFilled = true;

        if (mergedData.albumImg && mergedData.albumImg !== albumDb.image_url) {
          await UserSubmissionManager.#deletePendingFile({
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
          await UserSubmissionManager.#deletePendingFile({
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
            await UserSubmissionManager.#deletePendingFile({
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
            await UserSubmissionManager.#deletePendingFile({
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
