const express = require("express");
const router = express.Router();
const { dbAll, dbGet } = require("../UTIL.js");

router.get("/", async (req, res) => {
  const queries = {
    totalResults: `
        SELECT
            (SELECT COUNT(*) FROM songs) + 
            (SELECT COUNT(*) FROM albums) + 
            (SELECT COUNT(*) FROM artists) +
            (SELECT COUNT(*) FROM synths) +
            (SELECT COUNT(*) FROM presets) 
        AS total_results
    `,

    hot: `
        SELECT
            songs.id AS song_id,
            songs.title AS song_title,
            songs.genre AS song_genre,
            songs.image_url AS song_image,
            songs.release_year AS song_release_year,
            artists.name AS artist_name,
            albums.title AS album_title,
            COALESCE(song_clicks.recent_click, 0) AS recent_click_timestamp
        FROM songs
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        LEFT JOIN album_songs ON songs.id = album_songs.song_id
        LEFT JOIN albums ON album_songs.album_id = albums.id
        LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
        WHERE song_artists.role = 'Main'
        GROUP BY songs.id
        ORDER BY recent_click DESC
        LIMIT 9
    `,

    popular: `
        SELECT
            songs.id AS song_id,
            songs.title AS song_title,
            songs.genre AS song_genre,
            songs.image_url AS song_image,
            artists.name AS artist_name,
            albums.title AS album_title,
            COALESCE(song_clicks.clicks, 0) AS clicks
        FROM songs
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        LEFT JOIN album_songs ON songs.id = album_songs.song_id
        LEFT JOIN albums ON album_songs.album_id = albums.id
        LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
        WHERE song_artists.role = 'Main'
        GROUP BY songs.id
        ORDER BY clicks DESC
        LIMIT 6
    `,

    recentlyAdded: `
        SELECT
            songs.id AS song_id,
            songs.title AS song_title,
            songs.genre AS song_genre,
            songs.image_url AS song_image,
            songs.timestamp AS song_added_timestamp,
            artists.name AS artist_name,
            albums.title AS album_title
        FROM songs
        LEFT JOIN song_artists ON songs.id = song_artists.song_id
        LEFT JOIN artists ON song_artists.artist_id = artists.id
        LEFT JOIN album_songs ON songs.id = album_songs.song_id
        LEFT JOIN albums ON album_songs.album_id = albums.id
        LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
        WHERE song_artists.role = 'Main'
        GROUP BY songs.id
        ORDER BY song_added_timestamp DESC
        LIMIT 6
    `,

    topGenres: `
        SELECT
            genre,
            MAX(songs.image_url) AS song_image,
            SUM(COALESCE(song_clicks.clicks, 0)) AS total_clicks
        FROM songs
        LEFT JOIN song_clicks ON songs.id = song_clicks.song_id
        GROUP BY genre
        ORDER BY total_clicks DESC
        LIMIT 4;
    `,
  };

  try {
    const [totalResults, hot, popular, recentlyAdded, topGenres] =
      await Promise.all([
        dbGet(queries.totalResults),
        dbAll(queries.hot),
        dbAll(queries.popular),
        dbAll(queries.recentlyAdded),
        dbAll(queries.topGenres),
      ]);

    res.render("main/browse", {
      totalResults: totalResults.total_results,
      hot,
      popular,
      recentlyAdded,
      topGenres,
      PATH_URL: "browse",
    });
  } catch (err) {
    return res.status(500).send("Database error: " + err.message);
  }
});

module.exports = router;
