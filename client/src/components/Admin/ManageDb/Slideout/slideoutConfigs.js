export const slideoutConfigs = {
  songs: {
    title: "Edit Song",
    fields: [
      { key: "id", label: "Song ID" },
      { key: "timestamp", label: "Date Added" },
    ],
    inputs: [
      { key: "title", label: "Title" },
      { key: "genre", label: "Genre" },
      { key: "year", label: "Release Year" },
      { key: "songUrl", label: "Song URL" },
    ],
    imageInput: { key: "imageUrl", label: "Cover Image" },
    selectors: [
      {
        key: "album",
        label: "Album",
        dataFields: { idField: "id", labelField: "title" },
        searchTable: "albums",
      },
    ],
    lists: [
      {
        key: "artists",
        label: "Artists",
        hasInput: true,
        inputLabel: "Role",
        dataFields: {
          idField: "id",
          labelField: "name",
          inputField: "role",
        },
        searchTable: "artists",
      },
      {
        key: "presets",
        label: "Presets",
        hasInput: true,
        inputLabel: "Usage Type",
        dataFields: {
          idField: "id",
          labelField: "name",
          inputField: "usageType",
        },
        searchTable: "presets",
      },
    ],
  },
  artists: {
    title: "Edit Artist",
    fields: [
      { key: "id", label: "Artist ID" },
      { key: "timestamp", label: "Date Added" },
    ],
    inputs: [
      { key: "name", label: "Name" },
      { key: "country", label: "Country" },
    ],
    imageInput: { key: "imageUrl", label: "Artist Image" },
    lists: [
      {
        key: "songs",
        label: "Songs",
        hasInput: true,
        inputLabel: "Role",
        dataFields: {
          idField: "id",
          labelField: "title",
          inputField: "role",
        },
        searchTable: "songs",
      },
    ],
  },
  albums: {
    title: "Edit Album",
    fields: [
      { key: "id", label: "Album ID" },
      { key: "timestamp", label: "Date Added" },
    ],
    inputs: [
      { key: "title", label: "Title" },
      { key: "genre", label: "Genre" },
      { key: "year", label: "Release Year" },
    ],
    imageInput: { key: "imageUrl", label: "Cover Image" },
    lists: [
      {
        key: "songs",
        label: "Songs",
        hasInput: false,
        dataFields: { idField: "id", labelField: "title" },
        searchTable: "songs",
      },
    ],
  },
  synths: {
    title: "Edit Synth",
    fields: [
      { key: "id", label: "Synth ID" },
      { key: "timestamp", label: "Date Added" },
    ],
    inputs: [
      { key: "name", label: "Name" },
      { key: "manufacturer", label: "Manufacturer" },
      { key: "type", label: "Type" },
      { key: "year", label: "Release Year" },
    ],
    imageInput: { key: "imageUrl", label: "Synth Image" },
    lists: [
      {
        key: "presets",
        label: "Presets",
        hasInput: false,
        dataFields: { idField: "id", labelField: "name" },
        searchTable: "presets",
      },
    ],
  },
  presets: {
    title: "Edit Preset",
    fields: [
      { key: "id", label: "Preset ID" },
      { key: "timestamp", label: "Date Added" },
    ],
    inputs: [
      { key: "name", label: "Name" },
      { key: "packName", label: "Pack Name" },
      { key: "author", label: "Author" },
    ],
    selectors: [
      {
        key: "synth",
        label: "Synth",
        dataFields: { idField: "id", labelField: "name" },
        searchTable: "synths",
      },
    ],
  },
  genres: {
    title: "Edit Genre",
    fields: [
      { key: "id", label: "Genre ID" },
      { key: "timestamp", label: "Date Added" },
    ],
    inputs: [
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
    ],
    colorPickers: [
      { key: "textColor", label: "Text Color" },
      { key: "backgroundColor", label: "Background Color" },
      { key: "borderColor", label: "Border Color" },
    ],
  },
};
