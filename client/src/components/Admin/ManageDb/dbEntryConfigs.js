export const dbEntryConfigs = {
  songs: {
    gridClass: "gridLayoutSongs",
    columns: [
      { key: "title", label: "Title" },
      { key: "genre", label: "Genre" },
      { key: "year", label: "Year" },
      { key: "songUrl", label: "Song URL" },
      { key: "imageUrl", label: "Image URL" },
      { key: "timestamp", label: "Date Added" },
    ],
    sortOptions: [
      { value: "title", label: "Title" },
      { value: "year", label: "Year" },
      { value: "added", label: "Date Added" },
    ],
    filterOptions: ["title"],
  },
  artists: {
    gridClass: "gridLayoutArtists",
    columns: [
      { key: "name", label: "Name" },
      { key: "country", label: "Country" },
      { key: "imageUrl", label: "Image URL" },
      { key: "timestamp", label: "Date Added" },
    ],
    sortOptions: [
      { value: "name", label: "Name" },
      { value: "country", label: "Country" },
      { value: "added", label: "Date Added" },
    ],
    filterOptions: ["name", "country"],
  },
  albums: {
    gridClass: "gridLayoutAlbums",
    columns: [
      { key: "title", label: "Title" },
      { key: "genre", label: "Genre" },
      { key: "year", label: "Year" },
      { key: "imageUrl", label: "Image URL" },
      { key: "timestamp", label: "Date Added" },
    ],
    sortOptions: [
      { value: "title", label: "Title" },
      { value: "year", label: "Year" },
      { value: "added", label: "Date Added" },
    ],
    filterOptions: ["title"],
  },
  synths: {
    gridClass: "gridLayoutSynths",
    columns: [
      { key: "name", label: "Name" },
      { key: "manufacturer", label: "Manufacturer" },
      { key: "type", label: "Type" },
      { key: "year", label: "Year" },
      { key: "imageUrl", label: "Image URL" },
      { key: "timestamp", label: "Date Added" },
    ],
    sortOptions: [
      { value: "name", label: "Name" },
      { value: "manufacturer", label: "Manufacturer" },
      { value: "type", label: "Type" },
      { value: "year", label: "Year" },
      { value: "added", label: "Date Added" },
    ],
    filterOptions: ["name", "manufacturer"],
  },
  presets: {
    gridClass: "gridLayoutPresets",
    columns: [
      { key: "name", label: "Name" },
      { key: "packName", label: "Pack Name" },
      { key: "author", label: "Author" },
      { key: "timestamp", label: "Date Added" },
    ],
    sortOptions: [
      { value: "name", label: "Name" },
      { value: "pack", label: "Pack Name" },
      { value: "author", label: "Author" },
      { value: "added", label: "Date Added" },
    ],
    filterOptions: ["name", "pack", "author"],
  },
  genres: {
    gridClass: "gridLayoutGenres",
    columns: [
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
      { key: "textColor", label: "Text Color" },
      { key: "backgroundColor", label: "Background Color" },
      { key: "borderColor", label: "Border Color" },
      { key: "timestamp", label: "Date Added" },
    ],
    sortOptions: [
      { value: "genre", label: "Name" },
      { value: "added", label: "Date Added" },
    ],
    filterOptions: ["name"],
  },
};
