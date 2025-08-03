const express = require("express");
const router = express.Router();

const ClickManager = require("../../models/ClickManager.js");
const Song = require("../../models/Song.js");

router.get("/:id", async (req, res) => {
  const songId = req.params.id;

  try {
    await ClickManager.update("songs", songId);
    const song = await Song.getById(songId);
    if (!song) return res.status(404).json({ error: "Song not found" });

    const fullData = await song.getFullData();
    res.json({ data: fullData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/:id/related", async (req, res) => {
  const songId = req.params.id;
  const limit = parseInt(req.query.limit) || null;

  try {
    const song = await Song.getById(songId);
    if (!song) return res.status(404).json({ error: "Song not found" });

    const moreSongs = await song.getMoreSongs(limit);
    res.json({ data: moreSongs });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
