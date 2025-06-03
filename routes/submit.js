const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/", (req, res) => {
  res.render("submit");
});

router.post("/", (req, res) => {
  const rawData = JSON.stringify(req.body);

  const query = `INSERT INTO pending_submissions (data) VALUES (?)`;
  db.run(query, [rawData], function (err) {
    if (err) return res.status(500).send("Database error: " + err.message);
    res.redirect("/submit?success=1");
  });
});

module.exports = router;
