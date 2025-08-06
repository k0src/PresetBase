export const entryConfigs = {
  songs: {
    gridClass: "gridLayoutSongs",
    columns: [
      { key: "#", label: "#" },
      { key: "title", label: "Title" },
      { key: "album", label: "Album" },
      { key: "genre", label: "Genre" },
      { key: "year", label: "Year" },
    ],
    sortOptions: [
      { value: "title", label: "Title" },
      { value: "artist", label: "Artist" },
      { value: "album", label: "Album" },
      { value: "year", label: "Year" },
      { value: "added", label: "Date Added" },
    ],
  },
  artists: {
    gridClass: "gridLayoutArtists",
    columns: [
      { key: "#", label: "#" },
      { key: "name", label: "Name" },
      { key: "country", label: "Country" },
    ],
    sortOptions: [
      { value: "name", label: "Name" },
      { value: "country", label: "Country" },
      { value: "added", label: "Date Added" },
    ],
  },
  albums: {
    gridClass: "gridLayoutAlbums",
    columns: [
      { key: "#", label: "#" },
      { key: "title", label: "Title" },
      { key: "artist", label: "Artist" },
      { key: "genre", label: "Genre" },
      { key: "year", label: "Year" },
    ],
    sortOptions: [
      { value: "title", label: "Title" },
      { value: "artist", label: "Artist" },
      { value: "year", label: "Year" },
      { value: "added", label: "Date Added" },
    ],
  },
  synths: {
    gridClass: "gridLayoutSynths",
    columns: [
      { key: "#", label: "#" },
      { key: "name", label: "Name" },
      { key: "manufacturer", label: "Manufacturer" },
      { key: "type", label: "Type" },
      { key: "year", label: "Year" },
    ],
    sortOptions: [
      { value: "name", label: "Name" },
      { value: "manufacturer", label: "Manufacturer" },
      { value: "type", label: "Type" },
      { value: "year", label: "Year" },
      { value: "added", label: "Date Added" },
    ],
  },
  presets: {
    gridClass: "gridLayoutPresets",
    columns: [
      { key: "#", label: "#" },
      { key: "name", label: "Name" },
      { key: "synth", label: "Synth" },
      { key: "pack", label: "Pack" },
      { key: "author", label: "Author" },
    ],
    sortOptions: [
      { value: "name", label: "Name" },
      { value: "synth", label: "Synth" },
      { value: "pack", label: "Pack" },
      { value: "author", label: "Author" },
      { value: "added", label: "Date Added" },
    ],
  },
  genres: {
    gridClass: "gridLayoutGenres",
    columns: [
      { key: "#", label: "#" },
      { key: "genre", label: "Genre" },
      { key: "songCount", label: "# Songs" },
    ],
    sortOptions: [
      { value: "genre", label: "Genre" },
      { value: "songCount", label: "# Songs" },
    ],
  },
};
