import express from "express";
import Album from "../../models/Album.js";
import ClickManager from "../../models/ClickManager.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const albumId = req.params.id;

  try {
    await ClickManager.update("albums", albumId);
    const album = await Album.getById(albumId);
    if (!album) return res.status(404).json({ error: "Album not found" });

    const fullData = await album.getFullData();
    res.json({ data: fullData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/:id/related", async (req, res) => {
  const albumId = req.params.id;
  const limit = parseInt(req.query.limit) || null;

  try {
    const album = await Album.getById(albumId);
    if (!album) return res.status(404).json({ error: "Album not found" });

    const moreAlbums = await album.getMoreAlbums(limit);
    res.json({ data: moreAlbums });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

export default router;
