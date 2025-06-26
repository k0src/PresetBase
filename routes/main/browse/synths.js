const express = require("express");
const router = express.Router();
const {
  dbAll,
  dbGet,
  convertTimestamps,
  markNew,
  markHot,
} = require("../../../util/UTIL.js");

router.get("/", async (req, res) => {
  const sortKeys = {
    name: "synths.synth_name",
    manufacturer: "synths.manufacturer",
    type: "synths.synth_type",
    year: "synths.release_year",
    added: "synths.timestamp",
  };

  const sortKey = sortKeys[req.query.sort] || sortKeys.added;

  if (!sortKey) {
    return res.status(400).send("Invalid sort key");
  }

  const queries = {
    totalResults: `
        SELECT COUNT(*) AS total_results FROM synths`,

    synths: `
        SELECT
            synths.synth_name AS synth_name,
            synths.id AS synth_id,
            synths.manufacturer AS synth_manufacturer,
            synths.release_year AS synth_release_year,
            synths.image_url AS synth_image,
            synths.synth_type AS synth_type,
            synths.timestamp AS synth_added_timestamp,
            COALESCE(synth_clicks.recent_click, 0) AS synth_recent_click
        FROM synths
        LEFT JOIN synth_clicks ON synth_clicks.synth_id = synths.id
        ORDER BY ${sortKey}`,

    hotSynths: `
      SELECT
          synths.id AS synth_id,
          COALESCE(synth_clicks.recent_click, 0) AS recent_click
      FROM synths
      LEFT JOIN synth_clicks ON synth_clicks.synth_id = synths.id
      ORDER BY synth_clicks.recent_click DESC
      LIMIT 10`,
  };

  try {
    const [totalResults, synths, hotSynths] = await Promise.all([
      dbGet(queries.totalResults),
      dbAll(queries.synths),
      dbAll(queries.hotSynths),
    ]);

    markNew(synths, "synth");
    markHot(synths, hotSynths, "synth");
    convertTimestamps(synths, "synth");

    res.render("main/browse/synths", {
      totalResults: totalResults.total_results,
      synths,
      PATH_URL: "browse",
    });
  } catch (err) {
    return res
      .status(500)
      .render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

module.exports = router;
