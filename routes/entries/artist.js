const express = require("express");
const router = express.Router();
const { dbGet, dbRun, dbAll, getGenreStyles } = require("../../util/UTIL.js");

router.get("/:id", async (req, res) => {
  const artistId = req.params.id;
  const now = new Date().toISOString();

  const queries = {
    updateClick: `
      INSERT INTO artist_clicks (artist_id, clicks, recent_click)
      VALUES (?, 1, ?)
      ON CONFLICT(artist_id)
      DO UPDATE SET
        clicks = clicks + 1,
        recent_click = excluded.recent_click
    `,

    artist: `
      SELECT
        artists.id AS artist_id,
        artists.name AS artist_name,
        artists.image_url,
        artists.country AS artist_country,
        json_group_array(
          DISTINCT json_object(
            'id', songs.id,
            'title', songs.title,
            'image_url', songs.image_url,
            'song_genre', songs.genre,
            'song_year', songs.release_year,
            'album_title', albums.title
          )
        ) AS songs
      FROM artists
      LEFT JOIN song_artists ON artists.id = song_artists.artist_id
      LEFT JOIN songs ON song_artists.song_id = songs.id
      LEFT JOIN album_songs ON songs.id = album_songs.song_id
      LEFT JOIN albums ON album_songs.album_id = albums.id
      WHERE artists.id = ?
      GROUP BY artists.id
    `,

    albums: `
      SELECT
        albums.id AS album_id,
        albums.title AS album_title,
        albums.image_url
      FROM albums
      LEFT JOIN album_songs ON albums.id = album_songs.album_id
      LEFT JOIN song_artists ON album_songs.song_id = song_artists.song_id
      WHERE song_artists.artist_id = ? 
        AND albums.title IS NOT '[SINGLE]' 
        AND song_artists.role = 'Main'
      GROUP BY albums.id
    `,

    totalSongs: `
      SELECT 
        COUNT(*) AS total_songs
      FROM songs
      LEFT JOIN song_artists ON songs.id = song_artists.song_id
      WHERE song_artists.artist_id = ?
    `,

    favoriteSynth: `
      SELECT
        synths.id AS synth_id,
        synths.synth_name,
        COUNT(*) AS usage_count
      FROM artists
      JOIN song_artists ON artists.id = song_artists.artist_id
      JOIN songs ON song_artists.song_id = songs.id
      JOIN song_presets ON songs.id = song_presets.song_id
      JOIN presets ON song_presets.preset_id = presets.id
      JOIN preset_synths ON presets.id = preset_synths.preset_id
      JOIN synths ON preset_synths.synth_id = synths.id
      WHERE artists.id = ?
      GROUP BY synths.id, synths.synth_name
      ORDER BY usage_count DESC
      LIMIT 1
    `,
  };

  try {
    const isAuth = req.isAuthenticated();
    await dbRun(queries.updateClick, [artistId, now]);

    const [artist, albums, totalSongs, favoriteSynth] = await Promise.all([
      dbGet(queries.artist, [artistId]),
      dbAll(queries.albums, [artistId]),
      dbGet(queries.totalSongs, [artistId]),
      dbGet(queries.favoriteSynth, [artistId]),
    ]);

    if (artist) {
      artist.songs = JSON.parse(artist.songs);
    }

    const genreStyles = await getGenreStyles();

    res.render("entries/artist", {
      artist: artist,
      albums: albums,
      totalSongs: totalSongs.total_songs,
      favoriteSynth: favoriteSynth,
      genreStyles: genreStyles,
      isAuth,
      PATH_URL: "browse",
    });
  } catch (err) {
    return res
      .status(500)
      .render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

module.exports = router;
