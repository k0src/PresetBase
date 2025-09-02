import express from "express";
import Song from "../../models/Song.js";
import DB from "../../models/DB.js";
import SearchManager from "../../models/SearchManager.js";
import UserSubmissionManager from "../../models/UserSubmissionManager.js";
import { generalRateLimit } from "../../middleware/security.js";
import multer from "../../middleware/multer.js";

const router = express.Router();

router.get("/", async (req, res) => {
  res.json({
    message: "PresetBase API Server",
    version: "1.0.0",
  });
});

router.get("/search", generalRateLimit, async (req, res) => {
  try {
    const searchQuery = req.query.query?.toLowerCase().trim();

    if (!searchQuery) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const searchData = await SearchManager.getSearchResults(searchQuery);

    res.json({ data: searchData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.post("/submit", generalRateLimit, multer, async (req, res) => {
  try {
    await UserSubmissionManager.processSubmission({
      formData: req.body,
      fileData: req.files,
    });

    res.status(200).json({ message: "Submission processed successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/latest-entry", async (req, res) => {
  try {
    const latestEntry = await Song.getLatestSong();
    if (!latestEntry)
      return res.status(404).json({ error: "No entries found" });

    res.json({ data: latestEntry });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/number-entries", async (req, res) => {
  const query = `
    SELECT
    (
      (SELECT COUNT(*) FROM songs) +
      (SELECT COUNT(*) FROM albums) +
      (SELECT COUNT(*) FROM artists) +
      (SELECT COUNT(*) FROM synths) +
      (SELECT COUNT(*) FROM presets)
    ) AS totalCount`;

  try {
    const totalCount = await DB.get(query);
    return res.json({ data: totalCount.totalCount });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/total-entries", async (req, res) => {
  const query = `
      SELECT
        (SELECT COUNT(*) FROM songs) AS songs,
        (SELECT COUNT(*) FROM albums) AS albums,
        (SELECT COUNT(*) FROM artists) AS artists,
        (SELECT COUNT(*) FROM synths) AS synths,
        (SELECT COUNT(*) FROM presets) AS presets`;
  try {
    const totalEntries = await DB.get(query);
    return res.json({ data: totalEntries });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/entry-names", async (req, res) => {
  const { query, limit } = req.query;
  const limitNum = Math.min(Number(limit));

  const q = `
    WITH search_results AS (
      SELECT 'song' AS type, songs.id AS id, songs.title AS name
      FROM songs
      
      UNION ALL
      
      SELECT 'artist' AS type, artists.id AS id, artists.name AS name
      FROM artists
      
      UNION ALL
      
      SELECT 'album' AS type, albums.id AS id, albums.title AS name
      FROM albums
      WHERE albums.id != 0
      
      UNION ALL
      
      SELECT 'synth' AS type, synths.id AS id, synths.synth_name AS name
      FROM synths
      
      UNION ALL
      
      SELECT 'preset' AS type, presets.id AS id, presets.preset_name AS name
      FROM presets
    )
    SELECT * FROM search_results 
    WHERE name LIKE ?
    ORDER BY type, name
    LIMIT ?`;

  try {
    const data = await DB.all(q, [`%${query}%`, limitNum]);
    return res.json({ data: data });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/autofill/data/:type", async (req, res) => {
  const types = [
    "songTitle",
    "artistName",
    "albumTitle",
    "synthName",
    "presetName",
  ];

  const type = req.params.type;
  const query = req.query.query;

  if (!types.includes(type)) {
    return res.status(400).send("Invalid type parameter");
  }

  const queries = {
    songTitle: `
      SELECT
        songs.title AS songTitle,
        songs.song_url AS songUrl,
        songs.image_url AS songImg,
        songs.genre AS genre,
        songs.release_year AS songYear
      FROM songs
      WHERE songs.title LIKE ?`,

    artistName: `
      SELECT
        artists.name AS artistName,
        artists.image_url AS artistImg,
        artists.country AS artistCountry
      FROM artists
      WHERE artists.name LIKE ?`,

    albumTitle: `
      SELECT
        albums.title AS albumTitle,
        albums.genre AS genre,
        albums.release_year AS albumYear,
        albums.image_url AS albumImg
      FROM albums
      WHERE albums.title LIKE ?`,

    synthName: `
      SELECT
        synths.synth_name AS synthName,
        synths.manufacturer AS synthManufacturer,
        synths.synth_type AS synthType,
        synths.image_url AS synthImg,
        synths.release_year AS synthYear
      FROM synths
      WHERE synths.synth_name LIKE ?`,

    presetName: `
      SELECT
        presets.preset_name AS presetName,
        presets.pack_name AS presetPack,
        presets.author AS presetAuthor
      FROM presets
      WHERE presets.preset_name LIKE ?`,
  };

  try {
    const data = await DB.all(queries[type], [`%${query}%`]);
    return res.json({ data: data });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/autofill/suggestions/:type", async (req, res) => {
  const types = [
    "songTitle",
    "genre",
    "artistName",
    "artistCountry",
    "artistRole",
    "albumTitle",
    "synthName",
    "synthManufacturer",
    "presetName",
    "presetPack",
    "presetAuthor",
    "presetUsageType",
  ];

  const type = req.params.type;
  const { query, limit } = req.query;
  const limitNum = Math.min(Number(limit));

  if (!types.includes(type)) {
    return res.status(400).send("Invalid type parameter");
  }

  const queries = {
    songTitle: `
      SELECT DISTINCT
        songs.title AS suggestion
      FROM songs
      WHERE songs.title LIKE ?
      LIMIT ?`,

    albumTitle: `
      SELECT DISTINCT
        albums.title AS suggestion
      FROM albums
      WHERE albums.id != 0 AND albums.title LIKE ?
      LIMIT ?`,

    genre: `
      SELECT DISTINCT
        songs.genre AS suggestion
      FROM songs
      WHERE songs.genre LIKE ?
      LIMIT ?`,

    artistName: `
      SELECT DISTINCT
        artists.name AS suggestion
      FROM artists
      WHERE artists.name LIKE ?
      LIMIT ?`,

    artistCountry: `
      SELECT DISTINCT
        artists.country AS suggestion
      FROM artists
      WHERE artists.country LIKE ?
      LIMIT ?`,

    artistRole: `
      SELECT DISTINCT
        song_artists.role AS suggestion
      FROM song_artists
      WHERE song_artists.role LIKE ?
      LIMIT ?`,

    synthName: `
      SELECT DISTINCT
        synths.synth_name AS suggestion
      FROM synths
      WHERE synths.synth_name LIKE ?
      LIMIT ?`,

    synthManufacturer: `
      SELECT DISTINCT
        synths.manufacturer AS suggestion
      FROM synths
      WHERE synths.manufacturer LIKE ?
      LIMIT ?`,

    presetName: `
      SELECT DISTINCT
        presets.preset_name AS suggestion
      FROM presets
      WHERE presets.preset_name LIKE ?
      LIMIT ?`,

    presetPack: `
      SELECT DISTINCT
        presets.pack_name AS suggestion
      FROM presets
      WHERE presets.pack_name != 'unknown' AND 
      presets.pack_name != 'Unknown' AND 
      presets.pack_name LIKE ?
      LIMIT ?`,

    presetAuthor: `
      SELECT DISTINCT
        presets.author AS suggestion
      FROM presets
      WHERE presets.author != 'unknown' AND 
      presets.author != 'Unknown' AND 
      presets.author LIKE ?
      LIMIT ?`,

    presetUsageType: `
      SELECT DISTINCT
        song_presets.usage_type AS suggestion
      FROM song_presets
      WHERE song_presets.usage_type LIKE ?
      LIMIT ?`,
  };

  try {
    const data = await DB.all(queries[type], [`%${query}%`, limitNum]);
    return res.json({ data: data });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

export default router;
