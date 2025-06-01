const db = require("../db/db");

// DATABASE
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

// TIMESTAMP FORMATTING
const convertTimestamp = function (timestamp) {
  return new Date(timestamp).toLocaleString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

module.exports = { dbAll, dbGet, convertTimestamp };
