const express = require("express");
const router = express.Router();

const ClickManager = require("../../models/ClickManager.js");
const Album = require("../../models/Album.js");

// const { dbGet, dbRun, dbAll, getGenreStyles } = require("../../util/UTIL.js");

// router.get("/:id", async (req, res) => {
//   const albumId = req.params.id;
//   const now = new Date().toISOString();

//   const queries = {
//     updateClick: `
//       INSERT INTO album_clicks (album_id, clicks, recent_click)
//       VALUES (?, 1, ?)
//       ON CONFLICT(album_id)
//       DO UPDATE SET
//         clicks = clicks + 1,
//         recent_click = excluded.recent_click
//     `,

//     album: `
//       SELECT
//         albums.id AS album_id,
//         albums.title AS album_title,
//         albums.genre AS album_genre,
//         albums.release_year AS album_year,
//         albums.image_url,

//         (
//           SELECT json_object(
//             'id', artists.id,
//             'name', artists.name
//           )
//           FROM album_songs
//           JOIN song_artists ON album_songs.song_id = song_artists.song_id
//           JOIN artists ON song_artists.artist_id = artists.id
//           WHERE album_songs.album_id = albums.id
//             AND song_artists.role = 'Main'
//           LIMIT 1
//         ) AS artist,

//         json_group_array(
//           DISTINCT json_object(
//             'id', songs.id,
//             'title', songs.title,
//             'song_url', songs.song_url,
//             'image_url', songs.image_url,
//             'song_genre', songs.genre,
//             'song_year', songs.release_year
//           )
//         ) AS songs

//       FROM albums
//       JOIN album_songs ON albums.id = album_songs.album_id
//       JOIN songs ON songs.id = album_songs.song_id
//       WHERE albums.id = ?
//       GROUP BY albums.id
//     `,

//     moreAlbums: `
//       SELECT
//         albums.id AS album_id,
//         albums.title AS album_title,
//         albums.image_url,
//         COALESCE(album_clicks.clicks, 0) AS clicks
//       FROM albums
//       LEFT JOIN album_songs ON albums.id = album_songs.album_id
//       LEFT JOIN song_artists ON album_songs.song_id = song_artists.song_id
//       LEFT JOIN album_clicks ON albums.id = album_clicks.album_id
//       WHERE song_artists.artist_id = (
//           SELECT artists.id
//           FROM album_songs
//           JOIN song_artists ON album_songs.song_id = song_artists.song_id
//           JOIN artists ON song_artists.artist_id = artists.id
//           WHERE album_songs.album_id = ?
//             AND song_artists.role = 'Main'
//           LIMIT 1
//         )
//         AND song_artists.role = 'Main'
//         AND albums.title != '[SINGLE]'
//         AND albums.id != ?
//       GROUP BY albums.id
//       ORDER BY clicks DESC
//       LIMIT 5
//     `,
//   };

//   const isAuth = req.isAuthenticated();
//   const userIsAdmin = isAuth && req.user && req.user.is_admin;
//   try {
//     if (albumId === "0") {
//       return res.status(404).render("static/404", { PATH_URL: "404" });
//     }

//     await dbRun(queries.updateClick, [albumId, now]);

//     const [album, moreAlbums] = await Promise.all([
//       dbGet(queries.album, [albumId]),
//       dbAll(queries.moreAlbums, [albumId, albumId]),
//     ]);

//     if (album) {
//       album.songs = JSON.parse(album.songs);
//       album.artist = JSON.parse(album.artist);
//     }

//     const genreStyles = await getGenreStyles();

//     res.render("entries/album", {
//       isAuth,
//       userIsAdmin,
//       album: album,
//       moreAlbums: moreAlbums || [],
//       genreStyles: genreStyles,
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

router.get("/:id", async (req, res) => {
  const albumId = req.params.id;

  try {
    await ClickManager.update("albums", albumId);
    const album = await Album.getById(albumId);
    if (!album) return res.status(404).json({ error: "Album not found" });

    const fullData = await album.getFullData();
    res.json({ data: fullData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.get("/:id/related", async (req, res) => {
  const albumId = req.params.id;
  const limit = parseInt(req.query.limit) || null;

  try {
    const album = await Album.getById(albumId);
    if (!album) return res.status(404).json({ error: "Album not found" });

    const moreAlbums = await album.getMoreAlbums(limit);
    res.json({ data: moreAlbums });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
