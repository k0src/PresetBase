import express from "express";
import Album from "../../models/Album.js";
import { sortKeys, sortDirections } from "../../util/sortConfig.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const sortKey = sortKeys.albums[req.query.sort] || sortKeys.albums.added;
  const sortDirection = sortDirections[req.query.direction] || "ASC";

  try {
    const albumsData = await Album.getAll(sortKey, sortDirection);
    res.json({ data: albumsData });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/total-entries", async (req, res) => {
  try {
    const totalEntries = await Album.totalEntries();
    res.json({ data: totalEntries });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

export default router;
