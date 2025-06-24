const express = require("express");
const router = express.Router();
const { dbAll } = require("../../util/UTIL.js");

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
    "presetPackName",
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
        songs.title AS song_title
      FROM songs
      WHERE song_title LIKE ?
      LIMIT ?`,

    albumTitle: `
      SELECT DISTINCT
        albums.title AS album_title
      FROM albums
      WHERE albums.id != 0 AND album_title LIKE ?
      LIMIT ?`,

    genre: `
      SELECT DISTINCT
        songs.genre AS genre
      FROM songs
      WHERE genre LIKE ?
      LIMIT ?`,

    artistName: `
      SELECT DISTINCT
        artists.name AS artist_name
      FROM artists
      WHERE artist_name LIKE ?
      LIMIT ?`,

    artistCountry: `
      SELECT DISTINCT
        artists.country AS artist_country
      FROM artists
      WHERE artist_country LIKE ?
      LIMIT ?`,

    artistRole: `
      SELECT DISTINCT
        song_artists.role AS artist_role
      FROM song_artists
      WHERE artist_role LIKE ?
      LIMIT ?`,

    synthName: `
      SELECT DISTINCT
        synths.synth_name AS synth_name
      FROM synths
      WHERE synth_name LIKE ?
      LIMIT ?`,

    synthManufacturer: `
      SELECT DISTINCT
        synths.manufacturer AS synth_manufacturer
      FROM synths
      WHERE synth_manufacturer LIKE ?
      LIMIT ?`,

    presetName: `
      SELECT DISTINCT
        presets.preset_name AS preset_name
      FROM presets
      WHERE preset_name LIKE ?
      LIMIT ?`,

    presetPackName: `
      SELECT DISTINCT
        presets.pack_name AS preset_pack_name
      FROM presets
      WHERE presets.pack_name != 'unknown' AND 
      presets.pack_name != 'Unknown' AND 
      preset_pack_name LIKE ?
      LIMIT ?`,

    presetAuthor: `
      SELECT DISTINCT
        presets.author AS preset_author
      FROM presets
      WHERE presets.author != 'unknown' AND 
      presets.author != 'Unknown' AND 
      preset_author LIKE ?
      LIMIT ?`,

    presetUsageType: `
      SELECT DISTINCT
        song_presets.usage_type AS preset_usage_type
      FROM song_presets
      WHERE preset_usage_type LIKE ?
      LIMIT ?`,
  };

  try {
    const results = await dbAll(queries[type], [`%${query}%`, limitNum]);
    return res.json(results);
  } catch (err) {
    return res.render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

module.exports = router;
