const db = require("../db/db");

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

const convertTimestamp = function (timestamp) {
  return new Date(timestamp).toLocaleString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const moreRecentTimestamp = function (timestamp, daysMS) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  return diff < daysMS;
};

module.exports = {
  dbAll,
  dbGet,
  dbRun,
  convertTimestamp,
  moreRecentTimestamp,
  post,
};
