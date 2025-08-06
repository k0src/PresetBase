const express = require("express");
const router = express.Router();

const Genre = require("../../../models/Genre.js");
const { sortKeys, sortDirections } = require("../../../util/UTIL.js");

router.get("/", async (req, res) => {
  const sortKey = sortKeys.genres[req.query.sort] || sortKeys.genres.genre;
  const sortDirection = sortDirections[req.query.direction] || "ASC";

  try {
    const genresData = await Genre.getAll(sortKey, sortDirection);
    res.json({ data: genresData });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/total-entries", async (req, res) => {
  try {
    const totalEntries = await Genre.totalEntries();
    res.json({ data: totalEntries });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
