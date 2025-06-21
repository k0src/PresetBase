const express = require("express");
const router = express.Router();
const multer = require("../../middleware/multer.js");
const { dbRun, dbAll, attachFilesToBody } = require("../../util/UTIL.js");

/* Example submission */
router.get("/example", async (req, res) => {
  res.render("main/submit/submit-example", { PATH_URL: "submit" });
});

/* Main submit page */
router.get("/", async (req, res) => {
  const queries = {
    songTitles: `
      SELECT DISTINCT
        songs.title AS song_title
      FROM songs
      GROUP BY songs.id`,

    albumTitles: `
      SELECT DISTINCT
        albums.title AS album_title
      FROM albums
      WHERE albums.id != 0
      GROUP BY albums.id`,

    genres: `
      SELECT DISTINCT
        songs.genre AS genre
      FROM songs
      GROUP BY songs.id`,

    artistNames: `
      SELECT DISTINCT
        artists.name AS artist_name
      FROM artists
      GROUP BY artists.id`,

    artistCountrys: `
      SELECT DISTINCT
        artists.country AS artist_country
      FROM artists
      GROUP BY artists.id`,

    artistRoles: `
      SELECT DISTINCT
        song_artists.role AS artist_role
      FROM song_artists`,

    synthNames: `
      SELECT DISTINCT
        synths.synth_name AS synth_name
      FROM synths`,

    synthManufacturers: `
      SELECT DISTINCT
        synths.manufacturer AS synth_manufacturer
      FROM synths
      GROUP BY synths.id`,

    presetNames: `
      SELECT DISTINCT
        presets.preset_name AS preset_name
      FROM presets
      GROUP BY presets.id`,

    presetPacks: `
      SELECT DISTINCT
        presets.pack_name AS preset_pack_name
      FROM presets
      WHERE presets.pack_name != 'unknown' AND presets.pack_name != 'Unknown'
      GROUP BY presets.id`,

    presetAuthors: `
      SELECT DISTINCT
        presets.author AS preset_author
      FROM presets
      WHERE presets.author != 'unknown' AND presets.author != 'Unknown'
      GROUP BY presets.id`,

    presetUsageTypes: `
      SELECT DISTINCT
        song_presets.usage_type AS preset_usage_type
      FROM song_presets`,
  };

  try {
    const [
      songTitles,
      albumTitles,
      genres,
      artistNames,
      artistCountrys,
      artistRoles,
      synthNames,
      synthManufacturers,
      presetNames,
      presetPacks,
      presetAuthors,
      presetUsageTypes,
    ] = await Promise.all([
      dbAll(queries.songTitles),
      dbAll(queries.albumTitles),
      dbAll(queries.genres),
      dbAll(queries.artistNames),
      dbAll(queries.artistCountrys),
      dbAll(queries.artistRoles),
      dbAll(queries.synthNames),
      dbAll(queries.synthManufacturers),
      dbAll(queries.presetNames),
      dbAll(queries.presetPacks),
      dbAll(queries.presetAuthors),
      dbAll(queries.presetUsageTypes),
    ]);

    res.render("main/submit/submit", {
      songTitles: songTitles || [],
      albumTitles: albumTitles || [],
      genres: genres || [],
      artistNames: artistNames || [],
      artistCountrys: artistCountrys || [],
      artistRoles: artistRoles || [],
      synthNames: synthNames || [],
      synthManufacturers: synthManufacturers || [],
      presetNames: presetNames || [],
      presetPacks: presetPacks || [],
      presetAuthors: presetAuthors || [],
      presetUsageTypes: presetUsageTypes || [],
      success: req.query.success === "1",
      PATH_URL: "submit",
    });
  } catch (err) {
    return res.render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

router.post("/", multer, async (req, res) => {
  const rawData = attachFilesToBody(req.body, req.files);
  const pendingData = JSON.stringify(rawData);

  const query = `INSERT INTO pending_submissions (data) VALUES (?)`;

  try {
    await dbRun(query, [pendingData]);
  } catch (err) {
    return res.render("static/db-error", { err, PATH_URL: "db-error" });
  }

  res.redirect("/submit?success=1");
});

module.exports = router;
