const express = require("express");
const router = express.Router();

const Song = require("../../../models/Song.js");
const { sortKeys, sortDirections } = require("../../../util/UTIL.js");

router.get("/", async (req, res) => {
  const sortKey = sortKeys.songs[req.query.sort] || sortKeys.songs.added;
  const sortDirection = sortDirections[req.query.direction] || "ASC";

  try {
    const songsData = await Song.getAll(sortKey, sortDirection);
    res.json({ data: songsData });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/total-entries", async (req, res) => {
  try {
    const totalEntries = await Song.totalEntries();
    res.json({ data: totalEntries });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
