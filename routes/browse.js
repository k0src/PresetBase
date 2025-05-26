const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/", (req, res) => {
  const query = `SELECT title, id FROM songs`;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).send("Database error: " + err.message);
    }

    const songs = {
      title: rows.map((row) => row.title),
      id: rows.map((row) => row.id),
    };

    res.render("browse", { songs });
  });
});

module.exports = router;
