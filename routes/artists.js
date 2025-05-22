const express = require("express");
const router = express.Router();
const db = require("../db/db");

// GET /artist/:id
router.get("/:id", (req, res) => {
  const artistId = req.params.id;

  const query = `
        SELECT 
            artists.name AS artist_name,
            artists.country,
            artists.image_url,
            artists.bio,
            songs.id AS song_id,
            songs.title AS song_title,
            albums.title AS album_title,
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
        FROM artists
        LEFT JOIN song_artists ON artists.id = song_artists.artist_id
        LEFT JOIN songs ON song_artists.song_id = songs.id
        LEFT JOIN album_songs ON album_songs.song_id = songs.id
        LEFT JOIN albums ON albums.id = album_songs.album_id 
        WHERE artists.id = ?
    `;

  db.all(query, [artistId], (err, rows) => {
    if (err) {
      return res.status(500).send("Database error: " + err.message);
    }

    if (rows.length === 0) {
      return res.status(404).send("Artist not found");
    }

    const artist = {
      name: rows[0].artist_name,
      country: rows[0].country,
      image_url: rows[0].image_url,
      bio: rows[0].bio,
      songs: [],
    };

    rows.forEach((row) => {
      if (row.song_id) {
        let allArtists = [];

        if (row.all_artists) {
          allArtists = JSON.parse(row.all_artists).filter((artist) => {
            return artist.artist_name !== row.artist_name;
          });
        }

        artist.songs.push({
          id: row.song_id,
          title: row.song_title,
          album: row.album_title,
          role: row.role,
          image: row.song_img,
          all_artists: allArtists,
        });
      }
    });

    res.render("artist", { artist });
  });
});

module.exports = router;
