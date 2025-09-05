import express from "express";
import DB from "../../models/DB.js";

const router = express.Router();

router.get("/top-presets", async (req, res) => {
  try {
    const query = `
      SELECT 
        presets.preset_name AS presetName,
        COUNT(song_presets.id) as usageCount
      FROM presets 
      LEFT JOIN song_presets  ON presets.id = song_presets.preset_id
      GROUP BY presets.id
      ORDER BY usageCount DESC
      LIMIT 10`;

    const topPresets = await DB.all(query);
    res.json({ data: topPresets });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/top-synths", async (req, res) => {
  try {
    const query = `
      SELECT
        synths.synth_name AS synthName,
        COUNT(song_presets.id) AS usageCount
      FROM synths
      JOIN preset_synths ON synths.id = preset_synths.synth_id
      JOIN presets ON preset_synths.preset_id = presets.id
      LEFT JOIN song_presets ON presets.id = song_presets.preset_id
      GROUP BY synths.id, synths.synth_name
      ORDER BY usageCount DESC
      LIMIT 10`;

    const topSynths = await DB.all(query);
    res.json({ data: topSynths });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/top-artists", async (req, res) => {
  try {
    const query = `
      SELECT
        artists.name AS artistName,
        COUNT(song_presets.id) AS presetCount
      FROM artists
      JOIN song_artists ON artists.id = song_artists.artist_id
      JOIN songs ON song_artists.song_id = songs.id
      LEFT JOIN song_presets ON songs.id = song_presets.song_id
      GROUP BY artists.id, artists.name
      ORDER BY presetCount DESC
      LIMIT 10`;

    const topArtists = await DB.all(query);
    res.json({ data: topArtists });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/weekly-submissions", async (req, res) => {
  try {
    const query = `
      SELECT
        DATE(song_presets.timestamp, 'weekday 0', '-6 days') AS weekStart,
        COUNT(*) AS submissionCount
      FROM song_presets
      WHERE song_presets.timestamp >= DATETIME('now', '-1 year')
        AND song_presets.timestamp <= DATETIME('now')
      GROUP BY DATE(song_presets.timestamp, 'weekday 0', '-6 days')
      ORDER BY weekStart ASC`;

    const weeklySubmissionsData = await DB.all(query);
    res.json({ data: weeklySubmissionsData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/daily-content-activity", async (req, res) => {
  try {
    const query = `
      WITH daily_activity AS (
        SELECT
          DATE(song_clicks.recent_click) AS activityDate,
          COUNT(*) AS songActivity,
          0 AS artistActivity,
          0 AS synthActivity,
          0 AS albumActivity
        FROM song_clicks
        WHERE song_clicks.recent_click >= DATETIME('now', '-1 month')
          AND song_clicks.recent_click <= DATETIME('now')
        GROUP BY DATE(song_clicks.recent_click)

        UNION ALL

        SELECT
          DATE(artist_clicks.recent_click) AS activityDate,
          0 AS songActivity,
          COUNT(*) AS artistActivity,
          0 AS synthActivity,
          0 AS albumActivity
        FROM artist_clicks
        WHERE artist_clicks.recent_click >= DATETIME('now', '-1 month')
          AND artist_clicks.recent_click <= DATETIME('now')
        GROUP BY DATE(artist_clicks.recent_click)

        UNION ALL

        SELECT
          DATE(synth_clicks.recent_click) AS activityDate,
          0 AS songActivity,
          0 AS artistActivity,
          COUNT(*) AS synthActivity,
          0 AS albumActivity
        FROM synth_clicks
        WHERE synth_clicks.recent_click >= DATETIME('now', '-1 month')
          AND synth_clicks.recent_click <= DATETIME('now')
        GROUP BY DATE(synth_clicks.recent_click)

        UNION ALL

        SELECT
          DATE(album_clicks.recent_click) AS activityDate,
          0 AS songActivity,
          0 AS artistActivity,
          0 AS synthActivity,
          COUNT(*) AS albumActivity
        FROM album_clicks
        WHERE album_clicks.recent_click >= DATETIME('now', '-1 month')
          AND album_clicks.recent_click <= DATETIME('now')
        GROUP BY DATE(album_clicks.recent_click)
    )
    SELECT
      activityDate,
      SUM(songActivity) AS songActivity,
      SUM(artistActivity) AS artistActivity,
      SUM(synthActivity) AS synthActivity,
      SUM(albumActivity) AS albumActivity
    FROM daily_activity
    GROUP BY activityDate
    ORDER BY activityDate ASC`;

    const dailyContentActivityData = await DB.all(query);
    res.json({ data: dailyContentActivityData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/genre-distribution", async (req, res) => {
  try {
    const query = `
        SELECT
        songs.genre AS label,
        COUNT(*) AS value
      FROM songs
      WHERE songs.genre IS NOT NULL
        AND songs.genre != ''
      GROUP BY songs.genre
      ORDER BY value DESC
      LIMIT 10`;

    const genreDistributionData = await DB.all(query);
    res.json({ data: genreDistributionData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/cumulative-submissions", async (req, res) => {
  try {
    const query = `
      WITH daily_submissions AS (
        SELECT 
          DATE(song_presets.timestamp) AS submissionDate,
          COUNT(*) AS dailyCount
        FROM song_presets
        GROUP BY DATE(song_presets.timestamp)
        ORDER BY submissionDate ASC
      ),
      cumulative_submissions AS (
        SELECT 
          submissionDate,
          dailyCount,
          SUM(dailyCount) OVER (ORDER BY submissionDate ASC ROWS UNBOUNDED PRECEDING) AS cumulativeCount
        FROM daily_submissions
      )
      SELECT 
        submissionDate,
        cumulativeCount
      FROM cumulative_submissions
      ORDER BY submissionDate ASC`;

    const cumulativeSubmissionsData = await DB.all(query);
    res.json({ data: cumulativeSubmissionsData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/synth-era-distribution", async (req, res) => {
  try {
    const query = `
      SELECT
        CASE 
          WHEN synths.release_year < 2000 THEN 'Vintage (Pre-2000)'
          WHEN synths.release_year BETWEEN 2000 AND 2009 THEN '2000s Era'
          WHEN synths.release_year BETWEEN 2010 AND 2015 THEN 'Early 2010s'
          WHEN synths.release_year BETWEEN 2016 AND 2020 THEN 'Late 2010s'
          WHEN synths.release_year > 2020 THEN 'Modern (2020+)'
          ELSE 'Unknown Era'
        END AS label,
        COUNT(song_presets.id) AS value
      FROM synths
      JOIN preset_synths ON synths.id = preset_synths.synth_id
      JOIN presets ON preset_synths.preset_id = presets.id
      LEFT JOIN song_presets ON presets.id = song_presets.preset_id
      WHERE song_presets.id IS NOT NULL
      GROUP BY 
        CASE 
          WHEN synths.release_year < 2000 THEN 'Vintage (Pre-2000)'
          WHEN synths.release_year BETWEEN 2000 AND 2009 THEN '2000s Era'
          WHEN synths.release_year BETWEEN 2010 AND 2015 THEN 'Early 2010s'
          WHEN synths.release_year BETWEEN 2016 AND 2020 THEN 'Late 2010s'
          WHEN synths.release_year > 2020 THEN 'Modern (2020+)'
          ELSE 'Unknown Era'
        END
      ORDER BY value DESC`;

    const synthEraDistributionData = await DB.all(query);
    res.json({ data: synthEraDistributionData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/weekly-discovery-rate", async (req, res) => {
  try {
    const query = `
      WITH weekly_new_artists AS (
        SELECT
          DATE(artists.timestamp, 'weekday 0', '-6 days') AS weekStart,
          COUNT(*) AS newArtists
        FROM artists
        WHERE artists.timestamp >= DATETIME('now', '-6 months')
          AND artists.timestamp <= DATETIME('now')
        GROUP BY DATE(artists.timestamp, 'weekday 0', '-6 days')
        ORDER BY weekStart ASC
      )
      SELECT
        weekStart,
        newArtists
      FROM weekly_new_artists
      ORDER BY weekStart ASC`;

    const weeklyDiscoveryRateData = await DB.all(query);
    res.json({ data: weeklyDiscoveryRateData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/deep-cuts", async (req, res) => {
  try {
    const query = `
      SELECT
        songs.title AS songTitle,
        artists.name AS artistName,
        COUNT(song_presets.id) AS presetUsage,
        COALESCE(song_clicks.clicks, 0) AS totalClicks,
        CASE 
          WHEN COALESCE(song_clicks.clicks, 0) = 0 THEN COUNT(song_presets.id) * 100
          ELSE ROUND(COUNT(song_presets.id) * 1.0 / COALESCE(song_clicks.clicks, 1) * 100, 2)
        END AS deepCutScore,
        songs.genre,
        songs.release_year
      FROM songs
      JOIN song_artists ON songs.id = song_artists.song_id
      JOIN artists ON song_artists.artist_id = artists.id
      LEFT JOIN song_presets ON songs.id = song_presets.song_id
      LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
      WHERE song_presets.id IS NOT NULL
      GROUP BY songs.id, songs.title, song_clicks.clicks, songs.genre, songs.release_year
      HAVING COUNT(song_presets.id) >= 3
        AND COALESCE(song_clicks.clicks, 0) < 50
      ORDER BY deepCutScore DESC, presetUsage DESC
      LIMIT 10`;

    const deepCutsData = await DB.all(query);
    res.json({ data: deepCutsData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/top-song-monthly", async (req, res) => {
  try {
    const query = `
    WITH song_preset_counts AS (
      SELECT
        songs.id AS song_id,
        COUNT(song_presets.id) AS preset_count
      FROM songs
      JOIN song_presets ON songs.id = song_presets.song_id
      WHERE song_presets.timestamp >= DATETIME('now', '-1 month')
        AND song_presets.timestamp <= DATETIME('now')
      GROUP BY songs.id
      ORDER BY preset_count DESC
      LIMIT 1
    ),
    synth_grouped AS (
      SELECT
        songs.id AS song_id,
        synths.id AS synth_id,
        synths.synth_name AS synth_name,
        synths.image_url AS synth_image,
        json_group_array(
          json_object(
            'id', presets.id,
            'name', presets.preset_name,
            'usageType', song_presets.usage_type,
            'audioUrl', song_presets.audio_url
          )
        ) AS presets
      FROM songs
      JOIN song_presets ON songs.id = song_presets.song_id
      JOIN presets ON song_presets.preset_id = presets.id
      JOIN preset_synths ON presets.id = preset_synths.preset_id
      JOIN synths ON preset_synths.synth_id = synths.id
      WHERE song_presets.timestamp >= DATETIME('now', '-1 month')
        AND song_presets.timestamp <= DATETIME('now')
      GROUP BY songs.id, synths.id, synths.synth_name, synths.image_url
    )
    SELECT
      songs.id AS id,
      songs.title,
      songs.genre,
      songs.release_year,
      songs.image_url,
      json_object(
        'id', artists.id,
        'name', artists.name
      ) AS artist,
      spc.preset_count AS presetCount,
      json_group_array(
        json_object(
          'id', sg.synth_id,
          'name', sg.synth_name,
          'imageUrl', sg.synth_image,
          'presets', json(sg.presets)
          )
      ) AS synths
    FROM songs
    JOIN song_preset_counts spc ON songs.id = spc.song_id
    LEFT JOIN song_artists ON songs.id = song_artists.song_id
      AND song_artists.role = 'Main'
    JOIN artists ON song_artists.artist_id = artists.id
    JOIN synth_grouped sg ON songs.id = sg.song_id
    GROUP BY songs.id, songs.title, songs.genre, songs.release_year, 
      songs.image_url, artists.id, artists.name, spc.preset_count`;

    const deepCutsData = await DB.all(query);
    res.json({ data: deepCutsData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

export default router;
