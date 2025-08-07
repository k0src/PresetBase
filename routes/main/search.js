const express = require("express");
const router = express.Router();

const SearchManager = require("../../models/SearchManager.js");

router.get("/", async (req, res) => {
  const searchQuery = req.query.query?.toLowerCase().trim();

  if (!searchQuery) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const searchData = await SearchManager.getSearchResults(searchQuery);

    res.json({ data: searchData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
