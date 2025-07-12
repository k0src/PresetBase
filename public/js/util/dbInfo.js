export const DB_TABLES = Object.freeze([
  "album_clicks",
  "album_songs",
  "albums",
  "announcements",
  "artist_clicks",
  "artists",
  "genre_tags",
  "pending_submissions",
  "preset_synths",
  "presets",
  "song_artists",
  "song_clicks",
  "song_presets",
  "songs",
  "synth_clicks",
  "synths",
  "user_submissions",
  "users",
]);

export const DB_ENTRY_TABLES = [
  "albums",
  "artists",
  "presets",
  "songs",
  "synths",
];

export const isEntryTable = (table) => {
  return DB_ENTRY_TABLES.includes(table);
};

export const isValidTable = (table) => {
  return DB_TABLES.includes(table);
};
