const express = require("express");
const router = express.Router();
const multer = require("../../middleware/multer.js");
const isAdmin = require("../../middleware/is-admin.js");
const { dbAll, dbGet } = require("../../util/UTIL.js");

const tableKeys = ["songs", "artists", "albums", "synths", "presets"];

const renderPage = async (req, res) => {
  const table = req.params.table;

  if (table && !tableKeys.includes(table)) {
    return res.status(404).render("static/404", {
      isAuth: req.isAuthenticated(),
      userIsAdmin: req.user && req.user.is_admin,
      PATH_URL: "404",
    });
  }

  const isAuth = req.isAuthenticated();
  const userIsAdmin = req.user && req.user.is_admin;

  // Load songs table initally - most important
  const query = `
      SELECT COUNT(*) AS total_tables
      FROM sqlite_master
      WHERE type = 'table'
        AND name NOT LIKE 'sqlite_%'`;

  try {
    const totalTables = await dbGet(query);

    res.render("admin/manage-db", {
      isAuth,
      userIsAdmin,
      totalTables,
      PATH_URL: "admin",
    });
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth,
      userIsAdmin,
      PATH_URL: "db-error",
    });
  }
};

router.get("/table-data/:table", isAdmin, async (req, res) => {
  const tables = ["songs", "artists", "albums", "synths", "presets"];

  const table = req.params.table;

  if (!tables.includes(table)) {
    return res.status(404).json({
      error: "Table not found.",
    });
  }

  const where = table === "albums" ? "WHERE id != 0" : "";

  try {
    const tableData = await dbAll(`
      SELECT *
      FROM ${table}
      ${where}
      ORDER BY id ASC
    `);

    res.json(tableData);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while fetching table data.",
    });
  }
});

router.get("/song-data/:songId", isAdmin, async (req, res) => {
  const songId = req.params.songId;

  const query = `
    SELECT
      songs.id AS song_id,
      songs.title AS song_title,
      songs.song_url AS song_url,
      songs.image_url AS song_image,
      songs.timestamp AS song_timestamp,
      songs.genre AS song_genre,
      songs.release_year AS song_year,
      json_object('id', albums.id, 'title', albums.title) AS albums,
      
      json_group_array(
        DISTINCT json_object(
          'id', artists.id,
          'name', artists.name,
          'role', song_artists.role
        )
      ) AS artists,

      json_group_array(
        DISTINCT json_object(
          'id', presets.id,
          'name', presets.preset_name,
          'usage_type', song_presets.usage_type
        )
      ) AS presets

    FROM songs
    LEFT JOIN album_songs ON songs.id = album_songs.song_id
    LEFT JOIN albums ON album_songs.album_id = albums.id
    LEFT JOIN song_artists ON songs.id = song_artists.song_id
    LEFT JOIN artists ON song_artists.artist_id = artists.id
    LEFT JOIN song_presets ON songs.id = song_presets.song_id
    LEFT JOIN presets ON song_presets.preset_id = presets.id
    LEFT JOIN preset_synths ON presets.id = preset_synths.preset_id
    LEFT JOIN synths ON preset_synths.synth_id = synths.id
    WHERE songs.id = ?
    GROUP BY songs.id`;

  try {
    const song = await dbGet(query, [songId]);

    if (!song) {
      return res.status(404).json({
        error: "Song not found.",
      });
    }

    song.artists = song.artists ? JSON.parse(song.artists) : [];
    song.presets = song.presets ? JSON.parse(song.presets) : [];
    song.albums = song.albums ? JSON.parse(song.albums) : null;

    res.json(song);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while fetching song data.",
    });
  }
});

// For autofill dropdown inputs
router.get("/field-data/:table", isAdmin, async (req, res) => {
  const table = req.params.table;
  const query = req.query.query;
  const limit = req.query.limit;

  if (!tableKeys.includes(table)) {
    return res.status(404).json({
      error: "Table not found.",
    });
  }

  const queries = {
    albums: `
      SELECT
        albums.id AS id,
        albums.title AS label
      FROM albums
      WHERE albums.title LIKE ?
      LIMIT ?`,

    artists: `
      SELECT
        artists.id AS id,
        artists.name AS label
        FROM artists
      WHERE artists.name LIKE ?
      LIMIT ?`,

    presets: `
      SELECT
        presets.id AS id,
        presets.preset_name AS label
      FROM presets
      WHERE presets.preset_name LIKE ?
      LIMIT ?`,

    songs: `
      SELECT
        songs.id AS id,
        songs.title AS label
      FROM songs
      WHERE songs.title LIKE ?
      LIMIT ?`,

    synths: `
      SELECT
        synths.id AS id,
        synths.synth_name AS label
      FROM synths
      WHERE synths.synth_name LIKE ?
      LIMIT ?`,
  };

  try {
    const results = await dbAll(queries[table], [`%${query}%`, limit]);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: `An error occurred while fetching ${table} data.`,
    });
  }
});

router.get("/", isAdmin, renderPage);
router.get("/:table", isAdmin, renderPage);

module.exports = router;
