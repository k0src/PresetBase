const express = require("express");
const router = express.Router();
const { dbGet, dbRun, dbAll } = require("../UTIL.js");

router.get("/:id", async (req, res) => {
  const songId = req.params.id;
  const now = new Date().toISOString();

  const queries = {
    updateClick: `
      INSERT INTO song_clicks (song_id, clicks, recent_click)
      VALUES (?, 1, ?)
      ON CONFLICT(song_id)
      DO UPDATE SET
        clicks = clicks + 1,
        recent_click = excluded.recent_click
    `,

    song: `
      SELECT
        songs.id AS song_id,
        songs.title AS song_title,
        songs.song_url,
        songs.image_url,
        songs.genre AS song_genre,
        songs.release_year AS song_year,
        json_object('id', albums.id, 'title', albums.title) AS album,
        
        json_group_array(
          DISTINCT json_object(
            'id', artists.id,
            'name', artists.name,
            'role', song_artists.role
          )
        ) AS artists,

        json_group_array(
          DISTINCT json_object(
            'preset_id', presets.id,
            'name', presets.preset_name,
            'usage_type', song_presets.usage_type,
            'song_presets_id', song_presets.id,
            'synth_id', synths.id,
            'synth_name', synths.synth_name,
            'synth_image', synths.image_url
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
      GROUP BY songs.id
    `,

    moreSongs: `
      SELECT
        songs.id AS song_id,
        songs.title AS song_title,
        songs.image_url
      FROM songs
      JOIN song_artists ON songs.id = song_artists.song_id
      JOIN (
        SELECT song_artists.artist_id
        FROM song_artists
        WHERE song_artists.song_id = ?
          AND song_artists.role = 'Main'
      ) AS main_artist ON song_artists.artist_id = main_artist.artist_id
      LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
      WHERE songs.id != ?
      GROUP BY songs.id
      ORDER BY COALESCE(song_clicks.clicks, 0) DESC
      LIMIT 5
    `,
  };

  try {
    await dbRun(queries.updateClick, [songId, now]);

    const [song, moreSongs] = await Promise.all([
      dbGet(queries.song, [songId]),
      dbAll(queries.moreSongs, [songId, songId]),
    ]);

    if (song) {
      song.album = JSON.parse(song.album);
      song.artists = JSON.parse(song.artists);
      song.presets = JSON.parse(song.presets);
    }

    res.render("entries/song", {
      song: song,
      moreSongs: moreSongs || [],
      PATH_URL: "browse",
    });
  } catch (err) {
    return res.render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

module.exports = router;
