const db = require("../db/db");
const fs = require("fs").promises;
const path = require("path");

const NEW_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

/* -------------------------------- DATABASE -------------------------------- */
const dbAll = function (query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = function (query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbRun = function (query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

/* ---------------------------------- POST ---------------------------------- */
const post = function (url) {
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
  })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      window.location.reload();
    })
    .catch((error) => {
      console.error("POST request failed:", error);
      alert("Action failed. Please try again.");
    });
};

/* --------------------------- TIMESTAMP FUNCTIONS -------------------------- */
const moreRecentTimestamp = function (timestamp, daysMS) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  return diff < daysMS;
};

const convertTimestamp = function (timestamp) {
  return new Date(timestamp).toLocaleString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const convertTimestamps = function (entries, entryType) {
  entries.forEach((entry) => {
    entry[`${entryType}_added_timestamp`] = convertTimestamp(
      entry[`${entryType}_added_timestamp`]
    );
  });
};

const markNew = function (entries, entryType) {
  entries.forEach((entry) => {
    entry.is_new = moreRecentTimestamp(
      entry[`${entryType}_added_timestamp`],
      NEW_DAYS_MS
    );
  });
};

const markHot = function (entries, hotEntries, entryType) {
  entries.forEach((entry) => {
    entry.is_hot = hotEntries.some((hotEntry) => {
      return hotEntry[`${entryType}_id`] === entry[`${entryType}_id`];
    });
  });
};

const addedDaysAgo = function (timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffTime = Math.abs(now - past);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/* ---------------------------------- Files --------------------------------- */
const attachFilesToBody = function (body, files) {
  const updated = structuredClone(body);

  for (const file of files) {
    const field = file.fieldname;

    if (!field.includes("[") && !field.includes("]")) {
      updated[field] = file.filename;
      continue;
    }

    const pathRegex = /^([a-zA-Z0-9_]+)((?:\[[a-zA-Z0-9_]+\])+)$/;
    const match = field.match(pathRegex);
    if (!match) continue;

    const root = match[1];
    const pathString = match[2];

    const keys = [
      root,
      ...Array.from(pathString.matchAll(/\[([a-zA-Z0-9_]+)\]/g))
        .map((m) => m[1])
        .map((k) => (/^\d+$/.test(k) ? parseInt(k, 10) : k)),
    ];

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
};

/* --------------- Helper to delete images from pending folder -------------- */
const deletePendingImage = async (filename) => {
  try {
    const filepath = path.join(
      __dirname,
      "..",
      "public",
      "uploads",
      "images",
      "pending",
      filename
    );
    await fs.unlink(filepath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw new Error(`Failed to delete ${filename}:`, err.message);
    }
  }
};

/* ------------ Merge with existing DB data, fill in blank fields ----------- */
const mergeAndValidateSubmitData = async function (data) {
  try {
    const validated = structuredClone(data);

    const albumDB = await dbGet(
      `SELECT 
        id, 
        genre, 
        release_year AS year, 
        image_url 
      FROM albums WHERE title = ? AND release_year = ?`,
      [validated.albumTitle, validated.albumYear]
    );
    if (albumDB) {
      validated.albumGenre = albumDB.genre;
      validated.albumYear = String(albumDB.year);
      if (validated.albumImg) {
        validated.albumImg = albumDB.image_url;
        await deletePendingImage(data.albumImg);
      } else if (!validated.albumImg) {
        validated.albumImg = albumDB.image_url;
      }
    }

    const songDB = await dbGet(
      `SELECT 
        id, 
        genre, 
        release_year AS year,
        song_url,
        image_url
      FROM songs WHERE title = ? AND release_year = ?`,
      [validated.songTitle, validated.songYear]
    );
    if (songDB) {
      validated.songGenre = songDB.genre;
      validated.songYear = String(songDB.year);
      validated.songUrl = songDB.song_url;
      if (validated.songImg) {
        validated.songImg = songDB.image_url;
        await deletePendingImage(data.songImg);
      } else if (!validated.songImg) {
        validated.songImg = songDB.image_url;
      }
    } else {
      if (!validated.songImg || validated.songImg.trim() === "") {
        validated.songImg = validated.albumImg;
      }
    }

    for (let i = 0; i < validated.artists.length; i++) {
      const artist = validated.artists[i];
      const artistDB = await dbGet(
        `SELECT 
          id, 
          country, 
          image_url 
        FROM artists WHERE name = ? AND country = ?`,
        [artist.name, artist.country]
      );
      if (artistDB) {
        artist.country = artistDB.country;
        if (artist.img) {
          artist.img = artistDB.image_url;
          await deletePendingImage(data.artists[i].img);
        } else if (!artist.img) {
          artist.img = artistDB.image_url;
        }
      }
    }

    for (let i = 0; i < validated.synths.length; i++) {
      const synth = validated.synths[i];
      const synthDB = await dbGet(
        `SELECT 
          id, 
          manufacturer, 
          synth_type AS type, 
          release_year AS year, 
          image_url
        FROM synths WHERE synth_name = ? AND manufacturer = ?`,
        [synth.name, synth.manufacturer]
      );
      if (synthDB) {
        synth.manufacturer = synthDB.manufacturer;
        synth.type = synthDB.type;
        synth.year = String(synthDB.year);
        if (synth.img) {
          synth.img = synthDB.image_url;
          await deletePendingImage(data.synths[i].img);
        } else if (!synth.img) {
          synth.img = synthDB.image_url;
        }
      }

      for (let j = 0; j < synth.presets.length; j++) {
        const preset = synth.presets[j];
        const presetDB = await dbGet(
          `SELECT
            presets.preset_name AS name,
            presets.pack_name, 
            presets.author
          FROM presets
          WHERE presets.preset_name = ?`,
          [preset.name]
        );

        if (presetDB) {
          preset.packName = presetDB.pack_name;
          preset.author = presetDB.author;
        } else {
          if (!preset.packName || preset.packName.trim() === "") {
            preset.packName = "Factory";
          }
          if (!preset.author || preset.author.trim() === "") {
            preset.author = synth.manufacturer;
          }
        }
      }
    }

    return validated;
  } catch (err) {
    throw new Error(`Validation failed: ${err.message}`);
  }
};

/* -------------------------------- Sanitize -------------------------------- */
const sanitizeData = function (data) {
  try {
    const sanitized = structuredClone(data);

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

    return sanitizeRecursive(sanitized);
  } catch (err) {
    throw new Error(`Could not sanitize: ${err.message}`);
  }
};

module.exports = {
  dbAll,
  dbGet,
  dbRun,
  convertTimestamps,
  markNew,
  markHot,
  addedDaysAgo,
  post,
  attachFilesToBody,
  sanitizeData,
  mergeAndValidateSubmitData,
};
