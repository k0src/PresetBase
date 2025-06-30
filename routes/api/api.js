const express = require("express");
const router = express.Router();
const { dbAll } = require("../../util/UTIL.js");

router.get("/loadcomplete/:type", async (req, res) => {
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
    const results = await dbAll(queries[type], [`%${query}%`]);
    return res.json(results);
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth: req.isAuthenticated(),
      PATH_URL: "db-error",
    });
  }
});

router.get("/autofill/:type", async (req, res) => {
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
        songs.title AS songTitle
      FROM songs
      WHERE songs.title LIKE ?
      LIMIT ?`,

    albumTitle: `
      SELECT DISTINCT
        albums.title AS albumTitle
      FROM albums
      WHERE albums.id != 0 AND albums.title LIKE ?
      LIMIT ?`,

    genre: `
      SELECT DISTINCT
        songs.genre AS genre
      FROM songs
      WHERE songs.genre LIKE ?
      LIMIT ?`,

    artistName: `
      SELECT DISTINCT
        artists.name AS artistName
      FROM artists
      WHERE artists.name LIKE ?
      LIMIT ?`,

    artistCountry: `
      SELECT DISTINCT
        artists.country AS artistCountry
      FROM artists
      WHERE artists.country LIKE ?
      LIMIT ?`,

    artistRole: `
      SELECT DISTINCT
        song_artists.role AS artistRole
      FROM song_artists
      WHERE song_artists.role LIKE ?
      LIMIT ?`,

    synthName: `
      SELECT DISTINCT
        synths.synth_name AS synthName
      FROM synths
      WHERE synths.synth_name LIKE ?
      LIMIT ?`,

    synthManufacturer: `
      SELECT DISTINCT
        synths.manufacturer AS synthManufacturer
      FROM synths
      WHERE synths.manufacturer LIKE ?
      LIMIT ?`,

    presetName: `
      SELECT DISTINCT
        presets.preset_name AS presetName
      FROM presets
      WHERE presets.preset_name LIKE ?
      LIMIT ?`,

    presetPack: `
      SELECT DISTINCT
        presets.pack_name AS presetPack
      FROM presets
      WHERE presets.pack_name != 'unknown' AND 
      presets.pack_name != 'Unknown' AND 
      presets.pack_name LIKE ?
      LIMIT ?`,

    presetAuthor: `
      SELECT DISTINCT
        presets.author AS presetAuthor
      FROM presets
      WHERE presets.author != 'unknown' AND 
      presets.author != 'Unknown' AND 
      presets.author LIKE ?
      LIMIT ?`,

    presetUsageType: `
      SELECT DISTINCT
        song_presets.usage_type AS presetUsageType
      FROM song_presets
      WHERE song_presets.usage_type LIKE ?
      LIMIT ?`,
  };

  try {
    const results = await dbAll(queries[type], [`%${query}%`, limitNum]);
    return res.json(results);
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth: req.isAuthenticated(),
      PATH_URL: "db-error",
    });
  }
});

router.get("/getallnames", async (req, res) => {
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
    return res.status(500).render("static/db-error", {
      err,
      isAuth: req.isAuthenticated(),
      PATH_URL: "db-error",
    });
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
    return res
      .status(500)
      .render("static/db-error", {
        err,
        isAuth: req.isAuthenticated(),
        PATH_URL: "db-error",
      });
  }
});

module.exports = router;
