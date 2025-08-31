import express from "express";
import Synth from "../../models/Synth.js";
import ClickManager from "../../models/ClickManager.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const synthId = req.params.id;

  try {
    await ClickManager.update("synths", synthId);
    const synth = await Synth.getById(synthId);
    if (!synth) return res.status(404).json({ error: "Synth not found" });

    const fullData = await synth.getFullData();
    res.json({ data: fullData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/:id/related", async (req, res) => {
  const synthId = req.params.id;
  const limit = parseInt(req.query.limit) || null;

  try {
    const synth = await Synth.getById(synthId);
    if (!synth) return res.status(404).json({ error: "Synth not found" });

    const moreSynths = await synth.getMoreSynths(limit);
    res.json({ data: moreSynths });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

export default router;
