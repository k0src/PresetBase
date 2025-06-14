const db = require("../db/db");

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

module.exports = {
  dbAll,
  dbGet,
  dbRun,
  convertTimestamps,
  markNew,
  markHot,
  addedDaysAgo,
  post,
};
