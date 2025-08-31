import express from "express";
import Artist from "../../models/Artist.js";
import ClickManager from "../../models/ClickManager.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const artistId = req.params.id;

  try {
    await ClickManager.update("artists", artistId);
    const artist = await Artist.getById(artistId);
    if (!artist) return res.status(404).json({ error: "Artist not found" });

    const fullData = await artist.getFullData();
    res.json({ data: fullData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/:id/total-songs", async (req, res) => {
  const artistId = req.params.id;

  try {
    const artist = await Artist.getById(artistId);
    if (!artist) return res.status(404).json({ error: "Artist not found" });

    const totalSongs = await artist.getTotalSongs();
    res.json({ data: totalSongs });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/:id/albums", async (req, res) => {
  const artistId = req.params.id;
  const limit = parseInt(req.query.limit) || null;

  try {
    const artist = await Artist.getById(artistId);
    if (!artist) return res.status(404).json({ error: "Artist not found" });

    const albums = await artist.getAlbums(limit);
    res.json({ data: albums });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/:id/favorite-synth", async (req, res) => {
  const artistId = req.params.id;

  try {
    const artist = await Artist.getById(artistId);
    if (!artist) return res.status(404).json({ error: "Artist not found" });

    const favoriteSynth = await artist.getFavoriteSynth();
    res.json({ data: favoriteSynth });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

export default router;
