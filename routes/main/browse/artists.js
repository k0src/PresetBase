const express = require("express");
const router = express.Router();

const Artist = require("../../../models/Artist.js");
const { sortKeys, sortDirections } = require("../../../util/UTIL.js");

router.get("/", async (req, res) => {
  const sortKey = sortKeys.artists[req.query.sort] || sortKeys.artists.added;
  const sortDirection = sortDirections[req.query.direction] || "ASC";

  try {
    const artistsData = await Artist.getAll(sortKey, sortDirection);
    res.json({ data: artistsData });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/total-entries", async (req, res) => {
  try {
    const totalEntries = await Artist.totalEntries();
    res.json({ data: totalEntries });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
