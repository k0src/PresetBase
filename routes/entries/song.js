const express = require("express");
const router = express.Router();

const ClickManager = require("../../models/ClickManager.js");
const Song = require("../../models/Song.js");

router.get("/:id", async (req, res) => {
  const songId = req.params.id;

  const isAuth = req.isAuthenticated();
  const userIsAdmin = isAuth && req.user && req.user.is_admin;

  try {
    await ClickManager.update("songs", songId);
    const song = await Song.getById(songId);

    if (!song) throw new Error(`Song with ID: ${songId} not found.`);

    const fullData = await song.getFullData();
    const moreSongs = await song.getMoreSongs(5);

    res.render("entries/song", {
      isAuth,
      userIsAdmin,
      song: fullData,
      moreSongs,
      PATH_URL: "browse",
    });
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth,
      userIsAdmin,
      PATH_URL: "db-error",
    });
  }
});

module.exports = router;
