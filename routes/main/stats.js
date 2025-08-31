import express from "express";
import DB from "../../models/DB.js";

const router = express.Router();

router.get("/top-presets", async (req, res) => {
  // const query = `
  //   SELECT
  //     presets.preset_name,
  //     synths.synth_name,
  //     COUNT(song_presets.id) AS preset_usage_count
  //   FROM presets
  //   LEFT JOIN preset_synths ON presets.id = preset_synths.preset_id
  //   LEFT JOIN synths ON preset_synths.synth_id = synths.id
  //   LEFT JOIN song_presets ON presets.id = song_presets.preset_id
  //   GROUP BY presets.id, presets.preset_name, synths.synth_name
  //   ORDER BY preset_usage_count DESC
  //   LIMIT 20
  // `;

  // try {
  //   const chartData = await dbAll(query);
  //   const labels = chartData.map((row) => row.preset_name);
  //   const values = chartData.map((row) => row.preset_usage_count);
  //   res.json({ labels, values });
  // } catch (err) {
  //   res.status(500).json({ error: err.message });
  // }
  res.json({ labels: [], values: [] });
});

router.get("/presets-per-synth", async (req, res) => {
  // const query = `
  //   SELECT
  //     synths.synth_name,
  //     COUNT(preset_id) AS num_presets
  //   FROM synths
  //   LEFT JOIN preset_synths ON synths.id = preset_synths.synth_id
  //   LEFT JOIN presets ON preset_synths.preset_id = presets.id
  //   GROUP BY synths.id
  //   ORDER BY num_presets DESC
  //   LIMIT 20
  // `;

  // try {
  //   const chartData = await dbAll(query);
  //   const labels = chartData.map((row) => row.synth_name);
  //   const values = chartData.map((row) => row.num_presets);
  //   res.json({ labels, values });
  // } catch (err) {
  //   res.status(500).json({ error: err.message });
  // }
  res.json({ labels: [], values: [] });
});

router.get("/top-synths", async (req, res) => {
  // const query = `
  //   SELECT
  //     synths.synth_name,
  //     COUNT(DISTINCT song_presets.song_id) AS song_usage_count
  //   FROM synths
  //   JOIN preset_synths ON synths.id = preset_synths.synth_id
  //   JOIN presets ON preset_synths.preset_id = presets.id
  //   JOIN song_presets ON presets.id = song_presets.preset_id
  //   GROUP BY synths.id, synths.synth_name
  //   ORDER BY song_usage_count DESC
  //   LIMIT 20
  // `;

  // try {
  //   const chartData = await dbAll(query);
  //   const labels = chartData.map((row) => row.synth_name);
  //   const values = chartData.map((row) => row.song_usage_count);
  //   res.json({ labels, values });
  // } catch (err) {
  //   res.status(500).json({ error: err.message });
  // }
  res.json({ labels: [], values: [] });
});

router.get("/synth-time-data", async (req, res) => {
  // const query = `
  //   SELECT
  //     strftime('%Y-%m-%d', recent_click) AS month,
  //     synths.synth_name,
  //     SUM(synth_clicks.clicks) AS total_clicks
  //   FROM synth_clicks
  //   JOIN synths ON synth_clicks.synth_id = synths.id
  //   WHERE recent_click IS NOT NULL
  //   GROUP BY month, synths.synth_name
  //   ORDER BY month, synths.synth_name
  // `;

  // try {
  //   const chartData = await dbAll(query);
  //   res.json({ chartData });
  // } catch (err) {
  //   res.status(500).json({ error: err.message });
  // }
  res.json({ chartData: [] });
});

router.get("/heatmap-data", async (req, res) => {
  // const query = `
  //   SELECT
  //     strftime('%Y-%m-%d', timestamp) AS date,
  //     COUNT(*) AS count
  //   FROM song_presets
  //   WHERE timestamp IS NOT NULL
  //   GROUP BY date
  //   ORDER BY date
  // `;

  // try {
  //   const chartData = await dbAll(query);
  //   res.json({ chartData });
  // } catch (err) {
  //   res.status(500).json({ error: err.message });
  // }
  res.json({ chartData: [] });
});

router.get("/community-stats", async (req, res) => {
  // const queries = {
  //   totalDbStats: `
  //     SELECT
  //       (
  //         (SELECT COUNT(*) FROM songs) +
  //         (SELECT COUNT(*) FROM albums) +
  //         (SELECT COUNT(*) FROM artists) +
  //         (SELECT COUNT(*) FROM synths) +
  //         (SELECT COUNT(*) FROM presets)
  //       ) AS total_count`,

  //   submissionsPerDay: `
  //     SELECT
  //       ROUND(CAST(COUNT(*) AS FLOAT) /
  //       COUNT(DISTINCT DATE(timestamp)), 2)
  //       AS avg_submissions_per_day
  //     FROM song_presets
  //     WHERE timestamp IS NOT NULL
  //   `,
  // };

  // try {
  //   const [totalDbStats, submissionsPerDay] = await Promise.all([
  //     dbGet(queries.totalDbStats),
  //     dbGet(queries.submissionsPerDay),
  //   ]);

  //   res.json({
  //     totalCount: totalDbStats.total_count,
  //     avgSubmissionsPerDay: submissionsPerDay.avg_submissions_per_day,
  //   });
  // } catch (err) {
  //   res.status(500).json({ error: err.message });
  // }
  res.json({ totalCount: 0, avgSubmissionsPerDay: 0 });
});

export default router;
