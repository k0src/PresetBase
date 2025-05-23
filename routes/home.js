const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/random-song-preset", (req, res) => {
  const query = `SELECT id FROM songs`;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).send("Database error: " + err.message);
    }

    const random = rows[Math.floor(Math.random() * rows.length)];
    res.json(random);
  });
});

module.exports = router;
