const express = require("express");
const router = express.Router();
const { dbAll } = require("../UTIL.js");

router.get("/", async (req, res) => {
  const queries = {
    songs: `
      SELECT
        songs.id AS song_id,
        songs.title AS song_title
      FROM songs
      GROUP BY songs.id`,

    artists: `
      SELECT
        artists.name AS artist_name,
        artists.id AS artist_id
      FROM artists
      ORDER BY artists.name`,

    albums: `
      SELECT
        albums.id AS album_id,
        albums.title AS album_title
      FROM albums
      GROUP BY albums.id`,

    synths: `
      SELECT
        synths.synth_name AS synth_name,
        synths.id AS synth_id
      FROM synths`,

    presets: `
      SELECT
        presets.id AS preset_id,
        presets.preset_name AS preset_name
      FROM presets
      GROUP BY presets.id`,
  };

  try {
    const [songs, artists, albums, synths, presets] = await Promise.all([
      dbAll(queries.songs),
      dbAll(queries.artists),
      dbAll(queries.albums),
      dbAll(queries.synths),
      dbAll(queries.presets),
    ]);

    res.render("static/index", {
      songs: songs || [],
      artists: artists || [],
      albums: albums || [],
      synths: synths || [],
      presets: presets || [],
      PATH_URL: "home",
    });
  } catch (err) {
    return res.render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

module.exports = router;
