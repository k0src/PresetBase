const express = require("express");
const router = express.Router();
const db = require("../../db/db");
const {
  dbAll,
  dbGet,
  convertTimestamp,
  moreRecentTimestamp,
} = require("../UTIL.js");

router.get("/", async (req, res) => {
  const sortKeys = {
    preset: "presets.preset_name",
    synth: "synths.synth_name",
    added: "presets.timestamp",
  };

  const sortKey = sortKeys[req.query.sort] || sortKeys.added;

  if (!sortKey) {
    return res.status(400).send("Invalid sort key");
  }

  const queries = {
    totalResults: `
        SELECT COUNT(*) AS total_results FROM presets`,

    presets: `
        SELECT
            presets.id AS preset_id,
            presets.preset_name AS preset_name,
            presets.pack_name AS preset_pack_name,
            presets.author AS preset_author,
            presets.timestamp AS preset_added_timestamp,
            synths.id AS synth_id,
            synths.synth_name AS synth_name,
            synths.image_url AS synth_image
        FROM presets
        LEFT JOIN preset_synths ON presets.id = preset_synths.preset_id
        LEFT JOIN synths ON preset_synths.synth_id = synths.id
        GROUP BY presets.id
        ORDER BY ${sortKey}`,
  };

  try {
    const [totalResults, presets] = await Promise.all([
      dbGet(queries.totalResults),
      dbAll(queries.presets),
    ]);

    if (presets) {
      presets.forEach((preset) => {
        preset.is_new = moreRecentTimestamp(
          preset.preset_added_timestamp,
          3 * 24 * 60 * 60 * 1000
        ); // 3 days
        preset.preset_added_timestamp = convertTimestamp(
          preset.preset_added_timestamp
        );
      });
    }

    res.render("browse/presets", {
      totalResults: totalResults.total_results,
      presets,
    });
  } catch (err) {
    return res.status(500).send("Database error: " + err.message);
  }
});

module.exports = router;
