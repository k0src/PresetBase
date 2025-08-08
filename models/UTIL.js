const db = require("../db/db");

/* ------------------------ MOVE ME TO A UTIL FOLDER ------------------------ */

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

const formatDateAndTime = (date) =>
  new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDate = (date) =>
  new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

module.exports = {
  dbAll,
  dbGet,
  dbRun,
  formatDateAndTime,
  formatDate,
};
