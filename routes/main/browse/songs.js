const express = require("express");
const router = express.Router();

const Song = require("../../../models/Song.js");
const { sortKeys, sortDirections } = require("../../../util/UTIL.js");

router.get("/", async (req, res) => {
  const sortKey = sortKeys.songs[req.query.sort] || sortKeys.songs.added;
  const sortDirection = sortDirections[req.query.direction] || "ASC";

  try {
    const songsData = await Song.getAll(sortKey, sortDirection);
    res.json({ data: songsData });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/total-entries", async (req, res) => {
  try {
    const totalEntries = await Song.totalEntries();
    res.json({ data: totalEntries });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

//     hotSongs: `
//       SELECT
//           songs.id AS song_id,
//           COALESCE(song_clicks.recent_click, 0) AS recent_click
//       FROM songs
//       LEFT JOIN song_clicks ON song_clicks.song_id = songs.id
//       ORDER BY song_clicks.recent_click DESC
//       LIMIT 10`,
//   };

//   const isAuth = req.isAuthenticated();
//   const userIsAdmin = isAuth && req.user && req.user.is_admin;

//   try {
//     const [totalResults, songs, hotSongs] = await Promise.all([
//       dbGet(queries.totalResults),
//       dbAll(queries.songs),
//       dbAll(queries.hotSongs),
//     ]);

//     markNew(songs, "song");
//     markHot(songs, hotSongs, "song");
//     convertTimestamps(songs, "song");

//     const genreStyles = await getGenreStyles();

//     res.render("main/browse/songs", {
//       isAuth,
//       userIsAdmin,
//       totalResults: totalResults.total_results,
//       songs,
//       genreStyles,
//       PATH_URL: "browse",
//     });
//   } catch (err) {
//     return res.status(500).render("static/db-error", {
//       err,
//       isAuth,
//       userIsAdmin,
//       PATH_URL: "db-error",
//     });
//   }
// });

module.exports = router;
