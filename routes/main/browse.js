const express = require("express");
const router = express.Router();
const { dbAll, dbGet, addedDaysAgo } = require("../../util/UTIL.js");

router.get("/", async (req, res) => {
  const queries = {
    totalResults: `
        SELECT
            (SELECT COUNT(*) FROM songs) + 
            (SELECT COUNT(*) FROM albums) + 
            (SELECT COUNT(*) FROM artists) +
            (SELECT COUNT(*) FROM synths) +
            (SELECT COUNT(*) FROM presets) 
        AS total_results
    `,

    hot: `
        SELECT
            songs.id AS song_id,
            songs.title AS song_title,
            songs.genre AS song_genre,
            songs.image_url AS song_image,
            songs.release_year AS song_release_year,
            artists.name AS artist_name,
            albums.title AS album_title,
            COALESCE(song_clicks.recent_click, 0) AS recent_click_timestamp
        FROM songs
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        LEFT JOIN album_songs ON songs.id = album_songs.song_id
        LEFT JOIN albums ON album_songs.album_id = albums.id
        LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
        WHERE song_artists.role = 'Main'
        GROUP BY songs.id
        ORDER BY recent_click DESC
        LIMIT 9
    `,

    popular: `
        SELECT
            songs.id AS song_id,
            songs.title AS song_title,
            songs.genre AS song_genre,
            songs.image_url AS song_image,
            songs.release_year AS song_release_year,
            artists.name AS artist_name,
            albums.title AS album_title,
            COALESCE(song_clicks.clicks, 0) AS clicks
        FROM songs
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        LEFT JOIN album_songs ON songs.id = album_songs.song_id
        LEFT JOIN albums ON album_songs.album_id = albums.id
        LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
        WHERE song_artists.role = 'Main'
        GROUP BY songs.id
        ORDER BY clicks DESC
        LIMIT 8
    `,

    recentlyAdded: `
        SELECT
            songs.id AS song_id,
            songs.title AS song_title,
            songs.genre AS song_genre,
            songs.image_url AS song_image,
            songs.timestamp AS song_added_timestamp,
            songs.release_year AS song_release_year,
            artists.name AS artist_name,
            albums.title AS album_title
        FROM songs
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        LEFT JOIN album_songs ON songs.id = album_songs.song_id
        LEFT JOIN albums ON album_songs.album_id = albums.id
        LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
        WHERE song_artists.role = 'Main'
        GROUP BY songs.id
        ORDER BY song_added_timestamp DESC
        LIMIT 6
    `,

    mostRecent: `
      SELECT
          songs.id AS song_id,
          songs.title AS song_title,
          songs.genre AS song_genre,
          songs.image_url AS song_image,
          songs.timestamp AS song_added_timestamp,
          songs.release_year AS song_release_year,
          json_group_array(
              DISTINCT json_object(
                  'artist_id', artists.id,
                  'artist_name', artists.name,
                  'artist_role', song_artists.role
              )
          ) AS artists,
          albums.id AS album_id,
          albums.title AS album_title,
          json_group_array(
              DISTINCT json_object(
                  'synth_name', synths.synth_name,
                  'synth_id', synths.id
              )
          ) AS synths
      FROM songs
      LEFT JOIN song_artists ON songs.id = song_artists.song_id
      LEFT JOIN artists ON song_artists.artist_id = artists.id
      LEFT JOIN album_songs ON songs.id = album_songs.song_id
      LEFT JOIN albums ON album_songs.album_id = albums.id
      LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
      LEFT JOIN song_presets ON songs.id = song_presets.song_id
      LEFT JOIN presets ON song_presets.preset_id = presets.id
      LEFT JOIN preset_synths ON presets.id = preset_synths.preset_id
      LEFT JOIN synths ON preset_synths.synth_id = synths.id
      GROUP BY songs.id
      ORDER BY song_added_timestamp DESC
      LIMIT 1
    `,

    topGenres: `
      SELECT
          genre,
          MAX(songs.image_url) AS song_image,
          SUM(COALESCE(song_clicks.clicks, 0)) AS total_clicks,
          COUNT(*) AS num_songs
      FROM songs
      LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
      GROUP BY genre
      ORDER BY total_clicks DESC
      LIMIT 6;
    `,

    topSynths: `
      SELECT
          synths.id AS synth_id,
          synths.synth_name AS synth_name,
          COUNT(DISTINCT presets.id) AS num_presets,
          synths.image_url AS synth_image,
          synths.manufacturer AS synth_manufacturer,
          synths.release_year AS synth_release_year,
          COALESCE(synth_clicks.clicks, 0) AS clicks
      FROM synths
      LEFT JOIN preset_synths ON synths.id = preset_synths.synth_id
      LEFT JOIN presets ON preset_synths.preset_id = presets.id
      LEFT JOIN synth_clicks ON synths.id = synth_clicks.synth_id
      GROUP BY synths.id
      ORDER BY clicks DESC
      LIMIT 6
    `,
  };

  const isAuth = req.isAuthenticated();
  const userIsAdmin = isAuth && req.user && req.user.is_admin;

  try {
    const [
      totalResults,
      hot,
      popular,
      recentlyAdded,
      topGenres,
      mostRecent,
      topSynths,
    ] = await Promise.all([
      dbGet(queries.totalResults),
      dbAll(queries.hot),
      dbAll(queries.popular),
      dbAll(queries.recentlyAdded),
      dbAll(queries.topGenres),
      dbGet(queries.mostRecent),
      dbAll(queries.topSynths),
    ]);

    mostRecent.artists = JSON.parse(mostRecent.artists);
    mostRecent.synths = JSON.parse(mostRecent.synths);
    mostRecent.addedDaysAgo = addedDaysAgo(mostRecent.song_added_timestamp);

    res.render("main/browse", {
      isAuth,
      userIsAdmin,
      totalResults: totalResults.total_results,
      hot,
      popular,
      recentlyAdded,
      topGenres,
      mostRecent,
      topSynths,
      PATH_URL: "browse",
    });
  } catch (err) {
    return res.status(500).send("Database error: " + err.message);
  }
});

router.get("/chart-data", async (req, res) => {
  const query = `
    SELECT
      synths.synth_name,
      COUNT(preset_id) AS num_presets
    FROM synths
    LEFT JOIN preset_synths ON synths.id = preset_synths.synth_id
    LEFT JOIN presets ON preset_synths.preset_id = presets.id
    GROUP BY synths.id
    ORDER BY num_presets DESC
  `;

  const isAuth = req.isAuthenticated();
  const userIsAdmin = isAuth && req.user && req.user.is_admin;

  try {
    const chartData = await dbAll(query);
    const labels = chartData.map((row) => row.synth_name).slice(0, 20);
    const values = chartData.map((row) => row.num_presets).slice(0, 20);

    res.json({ labels, values });
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth,
      userIsAdmin,
      PATH_URL: "db-error",
    });
  }
});

module.exports = router;
