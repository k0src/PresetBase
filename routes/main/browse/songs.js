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

router.get("/popular", async (req, res) => {
  const sortKey = sortKeys.popular[req.query.sort] || sortKeys.popular.clicks;
  const sortDirection = sortDirections[req.query.direction] || "DESC";

  try {
    const popularSongsData = await Song.getPopularSongs(sortKey, sortDirection);
    res.json({ data: popularSongsData });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/hot", async (req, res) => {
  const sortKey = sortKeys.hot[req.query.sort] || sortKeys.hot.clicks;
  const sortDirection = sortDirections[req.query.direction] || "DESC";

  try {
    const hotSongsData = await Song.getHotSongs(sortKey, sortDirection);
    res.json({ data: hotSongsData });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/recent", async (req, res) => {
  const sortKey = sortKeys.recent[req.query.sort] || sortKeys.recent.added;
  const sortDirection = sortDirections[req.query.direction] || "DESC";

  try {
    const recentSongsData = await Song.getRecentSongs(sortKey, sortDirection);
    res.json({ data: recentSongsData });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
