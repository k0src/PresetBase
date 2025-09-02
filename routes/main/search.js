import express from "express";
import { generalRateLimit } from "../../middleware/security.js";
import SearchManager from "../../models/SearchManager.js";

const router = express.Router();

router.get("/", generalRateLimit, async (req, res) => {
  try {
    const searchQuery = req.query.query?.toLowerCase().trim();

    if (!searchQuery) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const searchData = await SearchManager.getSearchResults(searchQuery);

    res.json({ data: searchData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

export default router;
