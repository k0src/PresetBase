const express = require("express");
const router = express.Router();

const Preset = require("../../../models/Preset.js");
const { sortKeys, sortDirections } = require("../../../util/UTIL.js");

router.get("/", async (req, res) => {
  const sortKey = sortKeys.presets[req.query.sort] || sortKeys.presets.added;
  const sortDirection = sortDirections[req.query.direction] || "ASC";

  try {
    const presetsData = await Preset.getAll(sortKey, sortDirection);
    res.json({ data: presetsData });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/total-entries", async (req, res) => {
  try {
    const totalEntries = await Preset.totalEntries();
    res.json({ data: totalEntries });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
