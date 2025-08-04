const express = require("express");
const router = express.Router();
const { dbAll, dbGet } = require("../../util/UTIL.js");

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
    const dbStats = await dbGet(query);
    return res.json(dbStats);
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
    return res.json(totalCount.total_count);
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

router.get("/search", async (req, res) => {
  const searchQuery = req.query.query?.toLowerCase().trim();

  if (!searchQuery) {
    return res.status(400).json({ error: "Search query is required" });
  }

  const queries = {
    totalResults: `
      SELECT
        (SELECT COUNT(*) FROM songs WHERE LOWER(title) LIKE ?) +
        (SELECT COUNT(*) FROM artists WHERE LOWER(name) LIKE ?) +
        (SELECT COUNT(*) FROM albums WHERE LOWER(title) LIKE ?) +
        (SELECT COUNT(*) FROM synths WHERE LOWER(synth_name) LIKE ?) +
        (SELECT COUNT(*) FROM presets WHERE LOWER(preset_name) LIKE ?)
      AS total_results
    `,

    songs: `
      SELECT
        songs.id AS song_id,
        songs.title AS song_title,
        songs.genre AS song_genre,
        songs.release_year AS song_release_year,
        songs.image_url AS song_image,
        artists.name AS artist_name,
        artists.id AS artist_id,
        albums.title AS album_title,
        albums.id AS album_id
      FROM songs
      LEFT JOIN song_artists ON songs.id = song_artists.song_id
      LEFT JOIN artists ON song_artists.artist_id = artists.id
      LEFT JOIN album_songs ON songs.id = album_songs.song_id
      LEFT JOIN albums ON album_songs.album_id = albums.id
      LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
      WHERE song_artists.role = 'Main' AND LOWER(songs.title) LIKE ?
      GROUP BY songs.id
      ORDER BY songs.title`,

    artists: `
      SELECT
        artists.name AS artist_name,
        artists.id AS artist_id,
        artists.country AS artist_country,
        artists.image_url AS artist_image
      FROM artists WHERE LOWER(artists.name) LIKE ?
      ORDER BY artists.name`,

    albums: `
      SELECT
        albums.id AS album_id,
        albums.title AS album_title,
        albums.genre AS album_genre,
        albums.release_year AS album_release_year,
        albums.image_url AS album_image,
        artists.name AS artist_name,
        artists.id AS artist_id
      FROM albums
      LEFT JOIN album_songs ON albums.id = album_songs.album_id
      LEFT JOIN songs ON album_songs.song_id = songs.id
      LEFT JOIN song_artists ON songs.id = song_artists.song_id
      LEFT JOIN artists ON song_artists.artist_id = artists.id
      WHERE song_artists.role = 'Main' AND albums.title NOT LIKE '[SINGLE]'
      AND LOWER(albums.title) LIKE ?
      GROUP BY albums.id
      ORDER BY albums.title`,

    synths: `
      SELECT
        synths.synth_name AS synth_name,
        synths.id AS synth_id,
        synths.manufacturer AS synth_manufacturer,
        synths.release_year AS synth_release_year,
        synths.image_url AS synth_image,
        synths.synth_type AS synth_type
      FROM synths
      WHERE LOWER(synths.synth_name) LIKE ?
      ORDER BY synths.synth_name`,

    presets: `
      SELECT
        presets.id AS preset_id,
        presets.preset_name AS preset_name,
        presets.pack_name AS preset_pack_name,
        presets.author AS preset_author,
        synths.id AS synth_id,
        synths.synth_name AS synth_name,
        synths.image_url AS synth_image
      FROM presets
      LEFT JOIN preset_synths ON presets.id = preset_synths.preset_id
      LEFT JOIN synths ON preset_synths.synth_id = synths.id
      WHERE LOWER(presets.preset_name) LIKE ?
      GROUP BY presets.id
      ORDER BY presets.preset_name`,
  };

  try {
    const [totalResults, songs, artists, albums, synths, presets] =
      await Promise.all([
        dbGet(queries.totalResults, Array(5).fill(`%${searchQuery}%`)),
        dbAll(queries.songs, [`%${searchQuery}%`]),
        dbAll(queries.artists, [`%${searchQuery}%`]),
        dbAll(queries.albums, [`%${searchQuery}%`]),
        dbAll(queries.synths, [`%${searchQuery}%`]),
        dbAll(queries.presets, [`%${searchQuery}%`]),
      ]);

    res.json({
      totalResults: totalResults.total_results,
      songs: songs || [],
      artists: artists || [],
      albums: albums || [],
      synths: synths || [],
      presets: presets || [],
      searchQuery,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
