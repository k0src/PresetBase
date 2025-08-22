const express = require("express");
const router = express.Router();
const { dbAll, dbGet } = require("../../util/UTIL.js");
const Song = require("../../models/Song.js");
const Genre = require("../../models/Genre.js");

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

router.get("/top-genres", async (req, res) => {
  const limit = Number.isInteger(parseInt(req.query.limit))
    ? parseInt(req.query.limit)
    : null;

  try {
    const topGenres = await Genre.getTopGenres(limit);
    res.json({ data: topGenres });
  } catch (err) {
    console.error(err);
    return res
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
    const data = await dbAll(queries[type], [`%${query}%`]);
    return res.json(data);
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
    const results = await dbAll(queries[type], [`%${query}%`, limitNum]);
    return res.json(results);
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
    const results = await dbAll(q, [`%${query}%`, limitNum]);
    return res.json(results);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/checktags", async (req, res) => {
  const { name, slug } = req.query;

  if (!name && !slug) {
    return res
      .status(400)
      .json({ error: "Missing 'name' or 'slug' query parameter" });
  }

  const q = `
    SELECT EXISTS(
      SELECT 1 FROM genre_tags 
      WHERE name = ? OR slug = ?
    ) AS tag_exists;
  `;

  try {
    const result = await dbAll(q, [name, slug]);
    return res.json(result[0]);
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth: req.isAuthenticated(),
      PATH_URL: "db-error",
    });
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
    const totalEntries = await dbGet(query);
    return res.json({ data: totalEntries });
  } catch (err) {
    console.error(err);
    res
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
    ) AS total_count`;

  try {
    const totalCount = await dbGet(query);
    return res.json({ data: totalCount.total_count });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/submissions-per-day", async (req, res) => {
  const query = `
    SELECT
      ROUND(CAST(COUNT(*) AS FLOAT) / 
      COUNT(DISTINCT DATE(timestamp)), 2) 
      AS avg_submissions_per_day
    FROM song_presets
    WHERE timestamp IS NOT NULL`;

  try {
    const avgSubmissions = await dbGet(query);
    return res.json(avgSubmissions.avg_submissions_per_day);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
