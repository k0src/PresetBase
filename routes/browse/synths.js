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
            synths.timestamp AS synth_added_timestamp
        FROM synths
        ORDER BY ${sortKey}`,
  };

  try {
    const [totalResults, synths] = await Promise.all([
      dbGet(queries.totalResults),
      dbAll(queries.synths),
    ]);

    if (synths) {
      synths.forEach((synth) => {
        synth.is_new = moreRecentTimestamp(
          synth.synth_added_timestamp,
          3 * 24 * 60 * 60 * 1000
        ); // 3 days
        synth.synth_added_timestamp = convertTimestamp(
          synth.synth_added_timestamp
        );
      });
    }

    res.render("browse/synths", {
      totalResults: totalResults.total_results,
      synths,
      PATH_URL: "browse",
    });
  } catch (err) {
    return res.status(500).send("Database error: " + err.message);
  }
});

module.exports = router;
