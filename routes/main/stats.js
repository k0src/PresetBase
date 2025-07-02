const express = require("express");
const router = express.Router();
const { dbAll, dbGet, buildPresetChain } = require("../../util/UTIL.js");

router.get("/", async (req, res) => {
  const queries = {
    dbStats: `
      SELECT
        (SELECT COUNT(*) FROM songs) AS total_songs,
        (SELECT COUNT(*) FROM albums) AS total_albums,
        (SELECT COUNT(*) FROM artists) AS total_artists,
        (SELECT COUNT(*) FROM synths) AS total_synths,
        (SELECT COUNT(*) FROM presets) AS total_presets`,

    totalDbStats: `
      SELECT
        (
          (SELECT COUNT(*) FROM songs) +
          (SELECT COUNT(*) FROM albums) +
          (SELECT COUNT(*) FROM artists) +
          (SELECT COUNT(*) FROM synths) +
          (SELECT COUNT(*) FROM presets)
        ) AS total_count`,

    submissionsPerDay: `
      SELECT
        ROUND(CAST(COUNT(*) AS FLOAT) / 
        COUNT(DISTINCT DATE(timestamp)), 2) 
        AS avg_submissions_per_day
      FROM song_presets
      WHERE timestamp IS NOT NULL
    `,
  };

  const isAuth = req.isAuthenticated();
  const userIsAdmin = isAuth && req.user && req.user.is_admin;

  try {
    const [dbStats, totalDbStats, submissionsPerDay] = await Promise.all([
      dbGet(queries.dbStats),
      dbGet(queries.totalDbStats),
      dbGet(queries.submissionsPerDay),
    ]);

    res.render("main/stats", {
      isAuth,
      userIsAdmin,
      dbStats,
      totalDbStats,
      submissionsPerDay,
      PATH_URL: "stats",
    });
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth,
      userIsAdmin,
      PATH_URL: "db-error",
    });
  }
});

router.get("/top-presets-data", async (req, res) => {
  const query = `
    SELECT
      presets.preset_name,
      synths.synth_name,
      COUNT(song_presets.id) AS preset_usage_count
    FROM presets
    LEFT JOIN preset_synths ON presets.id = preset_synths.preset_id
    LEFT JOIN synths ON preset_synths.synth_id = synths.id
    LEFT JOIN song_presets ON presets.id = song_presets.preset_id
    GROUP BY presets.id, presets.preset_name, synths.synth_name
    ORDER BY preset_usage_count DESC
    LIMIT 20
  `;

  const isAuth = req.isAuthenticated();
  const userIsAdmin = isAuth && req.user && req.user.is_admin;

  try {
    const chartData = await dbAll(query);
    const labels = chartData.map((row) => row.preset_name);
    const values = chartData.map((row) => row.preset_usage_count);

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

router.get("/presets-per-synth-data", async (req, res) => {
  const query = `
    SELECT
      synths.synth_name,
      COUNT(preset_id) AS num_presets
    FROM synths
    LEFT JOIN preset_synths ON synths.id = preset_synths.synth_id
    LEFT JOIN presets ON preset_synths.preset_id = presets.id
    GROUP BY synths.id
    ORDER BY num_presets DESC
    LIMIT 20
  `;

  const isAuth = req.isAuthenticated();
  const userIsAdmin = isAuth && req.user && req.user.is_admin;

  try {
    const chartData = await dbAll(query);
    const labels = chartData.map((row) => row.synth_name);
    const values = chartData.map((row) => row.num_presets);

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

router.get("/top-synths-data", async (req, res) => {
  const query = `
    SELECT
      synths.synth_name,
      COUNT(DISTINCT song_presets.song_id) AS song_usage_count
    FROM synths
    JOIN preset_synths ON synths.id = preset_synths.synth_id
    JOIN presets ON preset_synths.preset_id = presets.id
    JOIN song_presets ON presets.id = song_presets.preset_id
    GROUP BY synths.id, synths.synth_name
    ORDER BY song_usage_count DESC
    LIMIT 20
  `;

  const isAuth = req.isAuthenticated();
  const userIsAdmin = isAuth && req.user && req.user.is_admin;

  try {
    const chartData = await dbAll(query);
    const labels = chartData.map((row) => row.synth_name);
    const values = chartData.map((row) => row.song_usage_count);

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

router.get("/synth-time-data", async (req, res) => {
  const query = `
    SELECT 
      strftime('%Y-%m-%d', recent_click) AS month,
      synths.synth_name,
      SUM(synth_clicks.clicks) AS total_clicks
    FROM synth_clicks
    JOIN synths ON synth_clicks.synth_id = synths.id
    WHERE recent_click IS NOT NULL
    GROUP BY month, synths.synth_name
    ORDER BY month, synths.synth_name
  `;

  const isAuth = req.isAuthenticated();
  const userIsAdmin = isAuth && req.user && req.user.is_admin;

  try {
    const chartData = await dbAll(query);
    res.json({ chartData });
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth,
      userIsAdmin,
      PATH_URL: "db-error",
    });
  }
});

router.get("/heatmap-data", async (req, res) => {
  const query = `
    SELECT
      strftime('%Y-%m-%d', timestamp) AS date,
      COUNT(*) AS count
    FROM song_presets
    WHERE timestamp IS NOT NULL
    GROUP BY date
    ORDER BY date
  `;

  try {
    const chartData = await dbAll(query);
    res.json({ chartData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/preset-chain-data", async (req, res) => {
  const queries = {
    artistPresetMap: `
      SELECT DISTINCT 
        sa.artist_id, 
        a.name AS artist_name, 
        sp.preset_id, 
        p.preset_name
      FROM song_artists sa
      JOIN artists a ON sa.artist_id = a.id
      JOIN song_presets sp ON sa.song_id = sp.song_id
      JOIN presets p ON sp.preset_id = p.id`,

    artistCollabMap: `
      SELECT DISTINCT 
        sa1.artist_id AS artist1, 
        a1.name AS name1,
        sa2.artist_id AS artist2, 
        a2.name AS name2
      FROM song_artists sa1
      JOIN artists a1 ON sa1.artist_id = a1.id
      JOIN song_artists sa2 ON sa1.song_id = sa2.song_id
      JOIN artists a2 ON sa2.artist_id = a2.id
      WHERE sa1.artist_id != sa2.artist_id`,
  };

  try {
    const [artistPresetMap, artistCollabMap] = await Promise.all([
      dbAll(queries.artistPresetMap),
      dbAll(queries.artistCollabMap),
    ]);

    const chartData = await buildPresetChain(artistPresetMap, artistCollabMap);
    res.json({ chartData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
