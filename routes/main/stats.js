const express = require("express");
const router = express.Router();
const { dbAll, dbGet, addedDaysAgo } = require("../../util/UTIL.js");

router.get("/", async (req, res) => {
  try {
    res.render("main/stats", {
      PATH_URL: "stats",
    });
  } catch (err) {
    return res.status(500).send("Database error: " + err.message);
  }
});

module.exports = router;
