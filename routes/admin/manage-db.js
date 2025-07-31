const express = require("express");
const router = express.Router();
const multer = require("../../middleware/multer.js");
const isAdmin = require("../../middleware/is-admin.js");
const {
  dbAll,
  dbGet,
  dbRun,
  attachFilesToBody,
  approveFile,
  deleteEntryImage,
} = require("../../util/UTIL.js");

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

// Data endpoint for tables
router.get("/table-data/:table", isAdmin, async (req, res) => {
  const tables = ["songs", "artists", "albums", "synths", "presets"];

  const sortKeys = {
    songs: [
      "id",
      "songs.title",
      "songs.genre",
      "songs.release_year",
      "songs.timestamp",
    ],
    artists: ["id", "artists.name", "artists.country", "artists.timestamp"],
    albums: [
      "id",
      "albums.title",
      "albums.genre",
      "albums.release_year",
      "albums.timestamp",
    ],
    synths: [
      "id",
      "synths.synth_name",
      "synths.manufacturer",
      "synths.synth_type",
      "synths.release_year",
      "synths.timestamp",
    ],
    presets: [
      "id",
      "presets.preset_name",
      "presets.pack_name",
      "presets.author",
      "presets.timestamp",
    ],
  };

  const table = req.params.table;
  const sortKey = req.query.sortKey || "id";
  const sortDirection = req.query.sortDirection || "ASC";

  if (!tables.includes(table)) {
    return res.status(404).json({
      error: "Table not found.",
    });
  }

  if (!sortKeys[table].includes(sortKey)) {
    return res.status(400).json({
      error: "Invalid sort key.",
    });
  }

  if (sortDirection !== "ASC" && sortDirection !== "DESC") {
    return res.status(400).json({
      error: "Invalid sort direction.",
    });
  }

  const where = table === "albums" ? "WHERE id != 0" : "";

  try {
    const tableData = await dbAll(`
      SELECT *
      FROM ${table}
      ${where}
      ORDER BY ${sortKey} ${sortDirection}
    `);

    res.json(tableData);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while fetching table data.",
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

// Data endpoint for slideout
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

router.put("/song-data", isAdmin, multer, async (req, res) => {
  try {
    const finalData = attachFilesToBody(req.body, req.files);

    let {
      id,
      song_title,
      song_genre,
      song_year,
      song_url,
      song_image,
      albums: album_id,
    } = finalData;

    const artists = JSON.parse(finalData.artists || "[]");
    const presets = JSON.parse(finalData.presets || "[]");

    if (!song_image || song_image.trim() === "") {
      const dbSongImg = await dbGet(
        `SELECT image_url FROM songs WHERE id = ?`,
        [id]
      );
      song_image = dbSongImg.image_url;
    } else {
      await deleteEntryImage("songs", id);
      await approveFile(song_image, "images");
    }

    await dbRun(
      `
      UPDATE songs
      SET title = ?, genre = ?, release_year = ?, song_url = ?, image_url = ?
      WHERE id = ?`,
      [song_title, song_genre, song_year, song_url, song_image, id]
    );

    await Promise.all([
      dbRun(`DELETE FROM song_artists WHERE song_id = ?`, [id]),
      dbRun(`DELETE FROM song_presets WHERE song_id = ?`, [id]),
      dbRun(`DELETE FROM album_songs WHERE song_id = ?`, [id]),
      dbRun(`INSERT INTO album_songs (song_id, album_id) VALUES (?, ?)`, [
        id,
        album_id,
      ]),
    ]);

    await Promise.all(
      artists.map((artist) =>
        dbRun(
          `INSERT INTO song_artists (song_id, artist_id, role)
       VALUES (?, ?, ?)`,
          [id, artist.id, artist.role]
        )
      )
    );

    await Promise.all(
      presets.map((preset) =>
        dbRun(
          `INSERT INTO song_presets (song_id, preset_id, usage_type, verified, timestamp)
       VALUES (?, ?, ?, 't', datetime())`,
          [id, preset.id, preset.usage_type]
        )
      )
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while updating song data.",
    });
  }
});

router.delete("/song-data/:songId", isAdmin, async (req, res) => {
  const songId = req.params.songId;
  const query = `DELETE FROM songs WHERE id = ?`;

  try {
    await dbGet(query, [songId]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while deleting song.",
    });
  }
});

router.get("/album-data/:albumId", isAdmin, async (req, res) => {
  const albumId = req.params.albumId;

  const query = `
    SELECT
      albums.id AS album_id,
      albums.title AS album_title,
      albums.image_url AS album_image,
      albums.timestamp AS album_timestamp,
      albums.genre AS album_genre,
      albums.release_year AS album_year,
      
      json_group_array(
        DISTINCT json_object(
          'id', songs.id,
          'title', songs.title
        )
      ) AS songs

    FROM albums
    LEFT JOIN album_songs ON albums.id = album_songs.album_id
    LEFT JOIN songs ON album_songs.song_id = songs.id
    WHERE albums.id = ?
    GROUP BY albums.id`;

  try {
    const album = await dbGet(query, [albumId]);

    if (!album) {
      return res.status(404).json({
        error: "Album not found.",
      });
    }

    album.songs = album.songs ? JSON.parse(album.songs) : [];

    res.json(album);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while fetching album data.",
    });
  }
});

router.put("/album-data", isAdmin, multer, async (req, res) => {
  try {
    const finalData = attachFilesToBody(req.body, req.files);

    let { id, album_title, album_genre, album_year, album_image } = finalData;

    const songs = JSON.parse(finalData.songs || "[]");

    if (!album_image || album_image.trim() === "") {
      const dbAlbumImg = await dbGet(
        `SELECT image_url FROM albums WHERE id = ?`,
        [id]
      );
      album_image = dbAlbumImg.image_url;
    } else {
      await deleteEntryImage("albums", id);
      await approveFile(album_image, "images");
    }

    await dbRun(
      `
      UPDATE albums
      SET title = ?, genre = ?, release_year = ?, image_url = ?
      WHERE id = ?`,
      [album_title, album_genre, album_year, album_image, id]
    );

    await dbRun(`DELETE FROM album_songs WHERE album_id = ?`, [id]);

    await Promise.all([
      songs.map((songId) =>
        dbRun(
          `INSERT INTO album_songs (song_id, album_id)
           VALUES (?, ?)`,
          [songId, id]
        )
      ),
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while updating album data.",
    });
  }
});

router.delete("/album-data/:albumId", isAdmin, async (req, res) => {
  const albumId = req.params.albumId;
  const query = `DELETE FROM albums WHERE id = ?`;

  try {
    await dbGet(query, [albumId]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while deleting album.",
    });
  }
});

router.get("/artist-data/:artistId", isAdmin, async (req, res) => {
  const artistId = req.params.artistId;

  const query = `
    SELECT
      artists.id AS artist_id,
      artists.name AS artist_name,
      artists.country AS artist_country,
      artists.image_url AS artist_image,
      artists.timestamp AS artist_timestamp,
      
      json_group_array(
        DISTINCT json_object(
          'id', songs.id,
          'title', songs.title,
          'role', song_artists.role
        )
      ) AS songs

    FROM artists
    LEFT JOIN song_artists ON artists.id = song_artists.artist_id
    LEFT JOIN songs ON song_artists.song_id = songs.id
    WHERE artists.id = ?
    GROUP BY artists.id`;

  try {
    const artist = await dbGet(query, [artistId]);

    if (!artist) {
      return res.status(404).json({
        error: "Artist not found.",
      });
    }

    artist.songs = artist.songs ? JSON.parse(artist.songs) : [];

    res.json(artist);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while fetching artist data.",
    });
  }
});

router.put("/artist-data", isAdmin, multer, async (req, res) => {
  try {
    const finalData = attachFilesToBody(req.body, req.files);

    let { id, artist_name, artist_country, artist_image } = finalData;

    const songs = JSON.parse(finalData.songs || "[]");

    if (!artist_image || artist_image.trim() === "") {
      const dbArtistImage = await dbGet(
        `SELECT image_url FROM artists WHERE id = ?`,
        [id]
      );
      artist_image = dbArtistImage.image_url;
    } else {
      await deleteEntryImage("artists", id);
      await approveFile(artist_image, "images");
    }

    await dbRun(
      `
      UPDATE artists
      SET name = ?, country = ?, image_url = ?
      WHERE id = ?`,
      [artist_name, artist_country, artist_image, id]
    );

    await dbRun(`DELETE FROM song_artists WHERE artist_id = ?`, [id]);

    await Promise.all([
      songs.map((song) =>
        dbRun(
          `INSERT INTO song_artists (song_id, artist_id, role)
           VALUES (?, ?, ?)`,
          [song.id, id, song.role]
        )
      ),
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while updating artist data.",
    });
  }
});

router.delete("/artist-data/:artistId", isAdmin, async (req, res) => {
  const artistId = req.params.artistId;
  const query = `DELETE FROM artists WHERE id = ?`;

  try {
    await dbGet(query, [artistId]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while deleting artist.",
    });
  }
});

router.get("/preset-data/:presetId", isAdmin, async (req, res) => {
  const presetId = req.params.presetId;

  const query = `
    SELECT
      presets.id AS preset_id,
      presets.preset_name AS preset_name,
      presets.pack_name AS preset_pack_name,
      presets.author AS preset_author,
      presets.timestamp AS preset_timestamp,
      json_object('id', synths.id, 'name', synths.synth_name) AS synths

    FROM presets
    LEFT JOIN preset_synths ON presets.id = preset_synths.preset_id
    LEFT JOIN synths ON preset_synths.synth_id = synths.id
    WHERE presets.id = ?
    GROUP BY presets.id`;

  try {
    const preset = await dbGet(query, [presetId]);

    if (!preset) {
      return res.status(404).json({
        error: "Preset not found.",
      });
    }

    preset.synths = preset.synths ? JSON.parse(preset.synths) : null;

    res.json(preset);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while fetching preset data.",
    });
  }
});

router.put("/preset-data", isAdmin, multer, async (req, res) => {
  try {
    const finalData = attachFilesToBody(req.body, req.files);

    let {
      id,
      preset_name,
      preset_pack_name,
      preset_author,
      synths: synth_id,
    } = finalData;

    await dbRun(
      `
      UPDATE presets
      SET preset_name = ?, pack_name = ?, author = ?
      WHERE id = ?`,
      [preset_name, preset_pack_name, preset_author, id]
    );

    await Promise.all([
      dbRun(`DELETE FROM preset_synths WHERE preset_id = ?`, [id]),
      dbRun(`INSERT INTO preset_synths (preset_id, synth_id) VALUES (?, ?)`, [
        id,
        synth_id,
      ]),
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while updating preset data.",
    });
  }
});

router.delete("/preset-data/:presetId", isAdmin, async (req, res) => {
  const presetId = req.params.presetId;
  const query = `DELETE FROM presets WHERE id = ?`;

  try {
    await dbGet(query, [presetId]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while deleting preset.",
    });
  }
});

router.get("/synth-data/:synthId", isAdmin, async (req, res) => {
  const synthId = req.params.synthId;

  const query = `
    SELECT
      synths.id AS synth_id,
      synths.synth_name AS synth_name,
      synths.manufacturer AS synth_manufacturer,
      synths.synth_type AS synth_type,
      synths.release_year AS synth_release_year,
      synths.image_url AS synth_image,
      synths.timestamp AS synth_timestamp,
      
      json_group_array(
        DISTINCT json_object(
          'id', presets.id,
          'name', presets.preset_name
        )
      ) AS presets

    FROM synths
    LEFT JOIN preset_synths ON synths.id = preset_synths.synth_id
    LEFT JOIN presets ON preset_synths.preset_id = presets.id
    WHERE synths.id = ?
    GROUP BY synths.id`;

  try {
    const synth = await dbGet(query, [synthId]);

    if (!synth) {
      return res.status(404).json({
        error: "Synth not found.",
      });
    }

    synth.presets = synth.presets ? JSON.parse(synth.presets) : null;

    res.json(synth);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while fetching synth data.",
    });
  }
});

router.put("/synth-data", isAdmin, multer, async (req, res) => {
  try {
    const finalData = attachFilesToBody(req.body, req.files);

    let {
      id,
      synth_name,
      synth_manufacturer,
      synth_type,
      synth_release_year,
      synth_image,
    } = finalData;

    const presets = JSON.parse(finalData.presets || "[]");

    if (!synth_image || synth_image.trim() === "") {
      const dbSynthImg = await dbGet(
        `SELECT image_url FROM synths WHERE id = ?`,
        [id]
      );
      synth_image = dbSynthImg.image_url;
    } else {
      await deleteEntryImage("synths", id);
      await approveFile(synth_image, "images");
    }

    await dbRun(
      `
      UPDATE synths
      SET synth_name = ?, manufacturer = ?, synth_type = ?, release_year = ?, image_url = ?
      WHERE id = ?`,
      [
        synth_name,
        synth_manufacturer,
        synth_type,
        synth_release_year,
        synth_image,
        id,
      ]
    );

    await dbRun(`DELETE FROM preset_synths WHERE synth_id = ?`, [id]);

    await Promise.all([
      presets.map((presetId) =>
        dbRun(
          `INSERT INTO preset_synths (preset_id, synth_id)
           VALUES (?, ?)`,
          [presetId, id]
        )
      ),
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while updating synth data.",
    });
  }
});

router.delete("/synth-data/:synthId", isAdmin, async (req, res) => {
  const synthId = req.params.synthId;
  const query = `DELETE FROM synths WHERE id = ?`;

  try {
    await dbGet(query, [synthId]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while deleting synth.",
    });
  }
});

router.get("/", isAdmin, renderPage);
router.get("/:table", isAdmin, renderPage);

module.exports = router;
