const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/", (req, res) => {
  const query = `SELECT id FROM songs`;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).send("Database error: " + err.message);
    }

    res.render("submit", { rows });
  });
});

module.exports = router;
