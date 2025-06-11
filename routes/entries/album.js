const express = require("express");
const router = express.Router();
const db = require("../../db/db");

// GET /album/:id
router.get("/:id", (req, res) => {
  const albumId = req.params.id;
  const now = new Date().toISOString();

  // UPDATE CLICKS + TIMESTAMP
  const updateClick = `
        INSERT INTO album_clicks (album_id, clicks, recent_click)
        VALUES (?, 1, ?)
        ON CONFLICT(album_id)
        DO UPDATE SET
            clicks = clicks + 1,
            recent_click = excluded.recent_click
  `;

  db.run(updateClick, [albumId, now], function (err) {
    if (err) {
      return res.status(500).send("Database error: " + err.message);
    }
  });

  const query = `
    SELECT 
      albums.title AS album_title,
      albums.release_year,
      albums.genre,
      albums.image_url,
      songs.id AS song_id,
      songs.title AS song_title,
      artists.id AS artist_id,
      artists.name AS artist_name,
      song_artists.role,
      songs.image_url AS song_img,
      (
        SELECT JSON_GROUP_ARRAY(
          JSON_OBJECT(
            'artist_id', sa2.artist_id,
            'artist_name', a2.name,
            'role', sa2.role
          )
        )
        FROM song_artists sa2
        JOIN artists a2 ON sa2.artist_id = a2.id
        WHERE sa2.song_id = songs.id
      ) AS all_artists
    FROM albums
    INNER JOIN album_songs ON albums.id = album_songs.album_id
    INNER JOIN songs ON album_songs.song_id = songs.id
    LEFT JOIN song_artists ON songs.id = song_artists.song_id
    LEFT JOIN artists ON song_artists.artist_id = artists.id
    WHERE albums.id = ?
    ORDER BY songs.id
  `;

  db.all(query, [albumId], (err, rows) => {
    if (err) return res.status(500).send("Database error: " + err.message);
    if (rows.length === 0) return res.status(404).send("Album not found.");

    const album = {
      title: rows[0].album_title,
      artist_name: rows[0].artist_name,
      artist_id: rows[0].artist_id,
      year: rows[0].release_year,
      genre: rows[0].genre,
      image_url: rows[0].image_url,
      songs: [],
    };

    const seenSongIds = new Set();

    rows.forEach((row) => {
      if (row.song_id && !seenSongIds.has(row.song_id)) {
        seenSongIds.add(row.song_id);

        let allArtists = [];

        if (row.all_artists) {
          allArtists = JSON.parse(row.all_artists);
        }

        album.songs.push({
          id: row.song_id,
          title: row.song_title,
          album: row.album_title,
          image: row.song_img,
          all_artists: allArtists,
        });
      }
    });

    res.render("entries/album", { album, PATH_URL: "browse" });
  });
});

module.exports = router;
