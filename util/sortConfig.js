export const sortKeys = {
  songs: {
    title: "songs.title",
    year: "songs.release_year",
    artist: "artists.name",
    album: "albums.title",
    added: "songs.timestamp",
  },
  popular: {
    title: "title",
    year: "year",
    artist: "json_extract(artist, '$.name')",
    album: "json_extract(album, '$.title')",
    added: "timestamp",
    clicks: "clicks",
  },
  hot: {
    title: "title",
    year: "year",
    artist: "json_extract(artist, '$.name')",
    album: "json_extract(album, '$.title')",
    added: "timestamp",
    hot: "hotScore",
  },
  recent: {
    title: "title",
    year: "year",
    artist: "json_extract(artist, '$.name')",
    album: "json_extract(album, '$.title')",
    added: "timestamp",
  },
  artists: {
    name: "artists.name",
    country: "artists.country",
    added: "artists.timestamp",
  },
  albums: {
    title: "albums.title",
    artist: "artists.name",
    year: "albums.release_year",
    added: "albums.timestamp",
  },
  synths: {
    name: "synths.synth_name",
    manufacturer: "synths.manufacturer",
    type: "synths.synth_type",
    year: "synths.release_year",
    added: "synths.timestamp",
  },
  presets: {
    name: "presets.preset_name",
    synth: "synths.synth_name",
    packName: "presets.pack_name",
    author: "presets.author",
    added: "presets.timestamp",
  },
  genres: {
    genre: "genre_tags.name",
    songCount: "songCount",
    added: "genre_tags.timestamp",
  },
  users: {
    username: "users.username",
    email: "users.email",
    authenticatedWith: "users.authenticated_with",
    added: "users.timestamp",
  },
};

export const sortDirections = {
  asc: "ASC",
  desc: "DESC",
};
