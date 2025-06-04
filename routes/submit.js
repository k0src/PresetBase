const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { dbRun } = require("./UTIL.js");

router.get("/", (req, res) => {
  res.render("submit");
});

router.post("/", async (req, res) => {
  const rawData = JSON.stringify(req.body);
  const query = `INSERT INTO pending_submissions (data) VALUES (?)`;

  try {
    await dbRun(query, [rawData]);
  } catch (err) {
    return res.status(500).send("Database error: " + err.message);
  }

  // If the request came from the admin approvals page, delete the pending submission
  if (req.get("referer") && req.get("referer").includes("/admin/approvals")) {
    try {
      await dbRun(`DELETE FROM pending_submissions WHERE id = ?`, [
        JSON.parse(rawData).submissionID,
      ]);
    } catch (err) {
      return res.status(500).send("Database error: " + err.message);
    }
    return res.redirect("/admin/approvals?success=1");
  }

  res.redirect("/submit?success=1");
});

module.exports = router;
