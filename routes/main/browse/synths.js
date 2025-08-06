const express = require("express");
const router = express.Router();

const Synth = require("../../../models/Synth.js");
const { sortKeys, sortDirections } = require("../../../util/UTIL.js");

router.get("/", async (req, res) => {
  const sortKey = sortKeys.synths[req.query.sort] || sortKeys.synths.added;
  const sortDirection = sortDirections[req.query.direction] || "ASC";

  try {
    const synthsData = await Synth.getAll(sortKey, sortDirection);
    res.json({ data: synthsData });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/total-entries", async (req, res) => {
  try {
    const totalEntries = await Synth.totalEntries();
    res.json({ data: totalEntries });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
