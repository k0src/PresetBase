const express = require("express");
const router = express.Router();
const db = require("../db/db");

// GET /artist/:id
router.get("/:id", (req, res) => {
  const artistId = req.params.id;

  const query = `
        SELECT DISTINCT
            artists.name AS artist_name,
            artists.country,
            artists.image_url,
            synths.id AS synth_id,
            synths.synth_name,
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
        LEFT JOIN song_presets ON songs.id = song_presets.song_id
        LEFT JOIN preset_synths ON song_presets.preset_id = preset_synths.preset_id
        LEFT JOIN synths ON preset_synths.synth_id = synths.id
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
      songs: [],
    };

    let allSynths = [];

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

      if (row.synth_id) {
        allSynths.push({
          id: row.synth_id,
          name: row.synth_name,
        });
      }
    });

    let synthFreq = {};
    let favSynth;
    let max = 0;

    allSynths.forEach((synth) => {
      synthFreq[synth.id] = (synthFreq[synth.id] || 0) + 1;
      if (synthFreq[synth.id] > max) {
        max = synthFreq[synth.id];
        favSynth = synth;
      }
    });

    artist.fav_synth = favSynth;

    res.render("artist", { artist });
  });
});

module.exports = router;
