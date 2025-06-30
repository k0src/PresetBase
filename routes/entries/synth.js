const express = require("express");
const router = express.Router();
const { dbGet, dbRun, dbAll } = require("../../util/UTIL.js");

router.get("/:id", async (req, res) => {
  const synthId = req.params.id;
  const now = new Date().toISOString();

  const queries = {
    updateClick: `
      INSERT INTO synth_clicks (synth_id, clicks, recent_click)
      VALUES (?, 1, ?)
      ON CONFLICT(synth_id)
      DO UPDATE SET
        clicks = clicks + 1,
        recent_click = excluded.recent_click
    `,

    synth: `
      SELECT
        synths.id AS synth_id,
        synths.synth_name,
        synths.manufacturer,
        synths.synth_type,
        synths.image_url,
        synths.release_year AS synth_year,

        json_group_array(
          DISTINCT json_object(
            'preset_id', presets.id,
            'name', presets.preset_name,
            'pack_name', presets.pack_name,
            'preset_author', presets.author,
            'synth_id', synths.id
          )
        ) AS presets

      FROM synths
      LEFT JOIN preset_synths ON synths.id = preset_synths.synth_id
      LEFT JOIN presets ON preset_synths.preset_id = presets.id
      WHERE synths.id = ?
      GROUP BY synths.id
    `,

    moreSynths: `
      SELECT
        synths.id AS synth_id,
        synths.synth_name,
        synths.image_url
      FROM synths
      LEFT JOIN synth_clicks ON synths.id = synth_clicks.synth_id
      WHERE synths.manufacturer = (
          SELECT manufacturer
          FROM synths
          WHERE synths.id = ?
      )
        AND synths.id != ?
      ORDER BY clicks DESC
      LIMIT 5
    `,
  };

  try {
    const isAuth = req.isAuthenticated();
    await dbRun(queries.updateClick, [synthId, now]);

    const [synth, moreSynths] = await Promise.all([
      dbGet(queries.synth, [synthId]),
      dbAll(queries.moreSynths, [synthId, synthId]),
    ]);

    if (synth) {
      synth.presets = JSON.parse(synth.presets);
    }

    res.render("entries/synth", {
      synth: synth,
      moreSynths: moreSynths || [],
      isAuth,
      PATH_URL: "browse",
    });
  } catch (err) {
    return res
      .status(500)
      .render("static/db-error", {
        err,
        isAuth: req.isAuthenticated(),
        PATH_URL: "db-error",
      });
  }
});

module.exports = router;
