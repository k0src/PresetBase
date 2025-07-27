import * as Components from "../components/Components.js";

/* ------------------------------ Table Config ------------------------------ */
// make these classes instead of objects
const TABLE_CONFIG = {
  songs: {
    title: "Song",
    id: "id",
    headerClassName: "result-columns grid-layout--songs",
    entryClassName: "grid-layout--songs db-entry",
    rowNumberClassName: "db-entry--number",
    columns: [
      {
        key: "title",
        label: "Title",
        className: "db-entry--primary song-title",
      },
      {
        key: "genre",
        label: "Genre",
        className: "db-entry--primary song-genre",
      },
      {
        key: "release_year",
        label: "Release Year",
        className: "db-entry--secondary song-year",
      },
      {
        key: "song_url",
        label: "Song URL",
        className: "db-entry--secondary song-url",
      },
      {
        key: "image_url",
        label: "Image URL",
        className: "db-entry--secondary song-image-url",
      },
      {
        key: "timestamp",
        label: "Added Date",
        className: "db-entry--date song-added-date",
      },
    ],
    sortKeys: [
      { label: "Title", value: "songs.title" },
      { label: "Genre", value: "songs.genre" },
      { label: "Year", value: "songs.release_year" },
      { label: "Date Added", value: "songs.timestamp" },
    ],
    filterForKeys: ["title", "genre"],
    filterSelector: "db-entry",
    actions: [
      {
        type: "button",
        className: "hidden-btn",
        content: `<i class="fa-solid fa-pen-to-square edit--icon"></i>`,
        callback: async (row, table) => {
          try {
            const slideout =
              await Components.DBSlideoutManager.createFromConfig(
                SLIDEOUT_CONFIG,
                table,
                row.id,
                async () => await this.loadTable(table)
              );
            slideout.show();
          } catch (err) {
            console.error(`Failed to initialize slideout: ${err.message}`);
          }
        },
      },
    ],
  },

  artists: {
    title: "Artist",
    id: "id",
    headerClassName: "result-columns grid-layout--artists",
    entryClassName: "grid-layout--artists db-entry",
    rowNumberClassName: "db-entry--number",
    columns: [
      {
        key: "name",
        label: "Name",
        className: "db-entry--primary artist-name",
      },
      {
        key: "country",
        label: "Country",
        className: "db-entry--secondary artist-country",
      },
      {
        key: "image_url",
        label: "Image URL",
        className: "db-entry--secondary artist-image-url",
      },
      {
        key: "timestamp",
        label: "Added Date",
        className: "db-entry--date artist-added-date",
      },
    ],
    sortKeys: [
      { label: "Name", value: "artists.name" },
      { label: "Country", value: "artists.country" },
      { label: "Date Added", value: "artists.timestamp" },
    ],
    filterForKeys: ["name", "country"],
    filterSelector: "db-entry",
    actions: [
      {
        type: "button",
        className: "hidden-btn",
        content: `<i class="fa-solid fa-pen-to-square edit--icon"></i>`,
        callback: async (row, table) => {
          try {
            const slideout =
              await Components.DBSlideoutManager.createFromConfig(
                SLIDEOUT_CONFIG,
                table,
                row.id,
                async () => await this.loadTable(table)
              );
            slideout.show();
          } catch (err) {
            console.error(`Failed to initialize slideout: ${err.message}`);
          }
        },
      },
    ],
  },

  albums: {
    title: "Album",
    id: "id",
    headerClassName: "result-columns grid-layout--albums",
    entryClassName: "grid-layout--albums db-entry",
    rowNumberClassName: "db-entry--number",
    columns: [
      {
        key: "title",
        label: "Title",
        className: "db-entry--primary album-title",
      },
      {
        key: "genre",
        label: "Genre",
        className: "db-entry--primary album-genre",
      },
      {
        key: "release_year",
        label: "Release Year",
        className: "db-entry--secondary album-year",
      },
      {
        key: "image_url",
        label: "Image URL",
        className: "db-entry--secondary album-image-url",
      },
      {
        key: "timestamp",
        label: "Added Date",
        className: "db-entry--date album-added-date",
      },
    ],
    sortKeys: [
      { label: "Title", value: "albums.title" },
      { label: "Genre", value: "albums.genre" },
      { label: "Year", value: "albums.release_year" },
      { label: "Date Added", value: "albums.timestamp" },
    ],
    filterForKeys: ["title", "genre"],
    filterSelector: "db-entry",
    actions: [
      {
        type: "button",
        className: "hidden-btn",
        content: `<i class="fa-solid fa-pen-to-square edit--icon"></i>`,
        callback: async (row, table) => {
          try {
            const slideout =
              await Components.DBSlideoutManager.createFromConfig(
                SLIDEOUT_CONFIG,
                table,
                row.id,
                async () => await this.loadTable(table)
              );
            slideout.show();
          } catch (err) {
            console.error(`Failed to initialize slideout: ${err.message}`);
          }
        },
      },
    ],
  },

  synths: {
    title: "Synth",
    id: "id",
    headerClassName: "result-columns grid-layout--synths",
    entryClassName: "grid-layout--synths db-entry",
    rowNumberClassName: "db-entry--number",
    columns: [
      {
        key: "synth_name",
        label: "Synth Name",
        className: "db-entry--primary synth-name",
      },
      {
        key: "manufacturer",
        label: "Manufacturer",
        className: "db-entry--primary synth-manufacturer",
      },
      {
        key: "release_year",
        label: "Release Year",
        className: "db-entry--secondary synth-year",
      },
      {
        key: "image_url",
        label: "Image URL",
        className: "db-entry--secondary synth-image-url",
      },
      {
        key: "timestamp",
        label: "Added Date",
        className: "db-entry--date synth-added-date",
      },
    ],
    sortKeys: [
      { label: "Name", value: "synths.synth_name" },
      { label: "Manufacturer", value: "synths.manufacturer" },
      { label: "Year", value: "synths.release_year" },
      { label: "Date Added", value: "synths.timestamp" },
    ],
    filterForKeys: ["synth_name", "manufacturer"],
    filterSelector: "db-entry",
    actions: [
      {
        type: "button",
        className: "hidden-btn",
        content: `<i class="fa-solid fa-pen-to-square edit--icon"></i>`,
        callback: async (row, table) => {
          try {
            const slideout =
              await Components.DBSlideoutManager.createFromConfig(
                SLIDEOUT_CONFIG,
                table,
                row.id,
                async () => await this.loadTable(table)
              );
            slideout.show();
          } catch (err) {
            console.error(`Failed to initialize slideout: ${err.message}`);
          }
        },
      },
    ],
  },

  presets: {
    title: "Preset",
    id: "id",
    headerClassName: "result-columns grid-layout--presets",
    entryClassName: "grid-layout--presets db-entry",
    rowNumberClassName: "db-entry--number",
    columns: [
      {
        key: "preset_name",
        label: "Preset Name",
        className: "db-entry--primary preset-name",
      },
      {
        key: "pack_name",
        label: "Pack Name",
        className: "db-entry--secondary preset-pack-name",
      },
      {
        key: "author",
        label: "Author",
        className: "db-entry--secondary preset-author",
      },
      {
        key: "timestamp",
        label: "Added Date",
        className: "db-entry--date preset-added-date",
      },
    ],
    sortKeys: [
      { label: "Name", value: "presets.preset_name" },
      { label: "Pack Name", value: "presets.pack_name" },
      { label: "Author", value: "presets.author" },
      { label: "Date Added", value: "presets.timestamp" },
    ],
    filterForKeys: ["preset_name", "pack_name", "author"],
    filterSelector: "db-entry",
    actions: [
      {
        type: "button",
        className: "hidden-btn",
        content: `<i class="fa-solid fa-pen-to-square edit--icon"></i>`,
        callback: async (row, table) => {
          try {
            const slideout =
              await Components.DBSlideoutManager.createFromConfig(
                SLIDEOUT_CONFIG,
                table,
                row.id,
                async () => await this.loadTable(table)
              );
            slideout.show();
          } catch (err) {
            console.error(`Failed to initialize slideout: ${err.message}`);
          }
        },
      },
    ],
  },
};

const SLIDEOUT_CONFIG = {
  songs: {
    id: "song_id",
    label: "Song",
    apiEndpoint: "/admin/manage-db/song-data/",
    title: "Edit Song",
    hasEntryPage: true,
    fields: [
      {
        key: "song_id",
        label: "Song ID:",
        type: "text",
      },
      {
        key: "song_timestamp",
        label: "Added:",
        type: "text",
      },
      {
        key: "song_id",
        label: "View song page",
        type: "link",
        href: "/song/",
      },
    ],
    inputs: [
      {
        key: "song_title",
        label: "Song Title",
        placeholder: "Song Title",
        type: "text",
      },
      {
        key: "song_genre",
        label: "Song Genre",
        placeholder: "Song Genre",
        type: "text",
      },
      {
        key: "song_year",
        label: "Release Year",
        placeholder: "Release Year",
        type: "text",
      },
      {
        key: "song_url",
        label: "Song URL",
        placeholder: "Song URL",
        type: "text",
      },
    ],
    fileUploads: [
      {
        type: "image",
        key: "song_image",
        label: "Song Image",
      },
    ],
    dropdownSelectors: [
      {
        key: "albums",
        dataFields: ["title", "id"],
        label: "Album",
        placeholder: "Search for album...",
        type: "text",
        apiFunction: async (query, limit) => {
          try {
            const response = await fetch(
              `/admin/manage-db/field-data/albums?query=${encodeURIComponent(
                query
              )}&limit=${limit}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error);
            }

            return await response.json();
          } catch (err) {
            throw new Error(`Failed to fetch autofill results: ${err.message}`);
          }
        },
      },
    ],
    lists: [
      {
        key: "artists",
        label: "Artists",
        dataFields: {
          id: "id",
          primary: "name",
          secondary: "role",
          numColumns: 2,
        },
        placeholder: "Search for artist...",
        apiFunction: async (query, limit) => {
          try {
            const response = await fetch(
              `/admin/manage-db/field-data/artists?query=${encodeURIComponent(
                query
              )}&limit=${limit}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error);
            }

            return await response.json();
          } catch (err) {
            throw new Error(`Failed to fetch autofill results: ${err.message}`);
          }
        },
      },
      {
        key: "presets",
        label: "Presets",
        dataFields: {
          id: "id",
          primary: "name",
          secondary: "usage_type",
          numColumns: 2,
        },
        placeholder: "Search for preset...",
        apiFunction: async (query, limit) => {
          try {
            const response = await fetch(
              `/admin/manage-db/field-data/presets?query=${encodeURIComponent(
                query
              )}&limit=${limit}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error);
            }

            return await response.json();
          } catch (err) {
            throw new Error(`Failed to fetch autofill results: ${err.message}`);
          }
        },
      },
    ],
  },
  albums: {
    id: "album_id",
    label: "Album",
    apiEndpoint: "/admin/manage-db/album-data/",
    title: "Edit Album",
    hasEntryPage: true,
    fields: [
      {
        key: "album_id",
        label: "Album ID:",
        type: "text",
      },
      {
        key: "album_timestamp",
        label: "Added:",
        type: "text",
      },
      {
        key: "album_id",
        label: "View album page",
        type: "link",
        href: "/album/",
      },
    ],
    inputs: [
      {
        key: "album_title",
        label: "Album Title",
        placeholder: "Album Title",
        type: "text",
      },
      {
        key: "album_genre",
        label: "Album Genre",
        placeholder: "Album Genre",
        type: "text",
      },
      {
        key: "album_year",
        label: "Release Year",
        placeholder: "Release Year",
        type: "text",
      },
    ],
    fileUploads: [
      {
        type: "image",
        key: "album_image",
        label: "Album Image",
      },
    ],
    dropdownSelectors: [],
    lists: [
      {
        key: "songs",
        label: "Songs",
        dataFields: {
          id: "id",
          primary: "title",
          numColumns: 1,
        },
        placeholder: "Search for song...",
        apiFunction: async (query, limit) => {
          try {
            const response = await fetch(
              `/admin/manage-db/field-data/songs?query=${encodeURIComponent(
                query
              )}&limit=${limit}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error);
            }

            return await response.json();
          } catch (err) {
            throw new Error(`Failed to fetch autofill results: ${err.message}`);
          }
        },
      },
    ],
  },
  artists: {
    id: "artist_id",
    label: "Artist",
    apiEndpoint: "/admin/manage-db/artist-data/",
    title: "Edit Artist",
    hasEntryPage: true,
    fields: [
      {
        key: "artist_id",
        label: "Artist ID:",
        type: "text",
      },
      {
        key: "artist_timestamp",
        label: "Added:",
        type: "text",
      },
      {
        key: "artist_id",
        label: "View artist page",
        type: "link",
        href: "/artist/",
      },
    ],
    inputs: [
      {
        key: "artist_name",
        label: "Artist Name",
        placeholder: "Artist Name",
        type: "text",
      },
      {
        key: "artist_country",
        label: "Artist Country",
        placeholder: "Artist Country",
        type: "text",
      },
    ],
    fileUploads: [
      {
        type: "image",
        key: "artist_image",
        label: "Artist Image",
      },
    ],
    dropdownSelectors: [],
    lists: [
      {
        key: "songs",
        label: "Songs",
        dataFields: {
          id: "id",
          primary: "title",
          secondary: "role",
          numColumns: 2,
        },
        placeholder: "Search for song...",
        apiFunction: async (query, limit) => {
          try {
            const response = await fetch(
              `/admin/manage-db/field-data/songs?query=${encodeURIComponent(
                query
              )}&limit=${limit}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error);
            }

            return await response.json();
          } catch (err) {
            throw new Error(`Failed to fetch autofill results: ${err.message}`);
          }
        },
      },
    ],
  },
  presets: {
    id: "preset_id",
    label: "Preset",
    apiEndpoint: "/admin/manage-db/preset-data/",
    title: "Edit Preset",
    hasEntryPage: false,
    fields: [
      {
        key: "preset_id",
        label: "Preset ID:",
        type: "text",
      },
      {
        key: "preset_timestamp",
        label: "Added:",
        type: "text",
      },
    ],
    inputs: [
      {
        key: "preset_name",
        label: "Preset Name",
        placeholder: "Preset Name",
        type: "text",
      },
      {
        key: "preset_pack_name",
        label: "Preset Pack Name",
        placeholder: "Preset Pack Name",
        type: "text",
      },
      {
        key: "preset_author",
        label: "Preset Author",
        placeholder: "Preset Author",
        type: "text",
      },
    ],
    fileUploads: [],
    dropdownSelectors: [
      {
        key: "synths",
        dataFields: ["name", "id"],
        label: "Synth",
        placeholder: "Search for synth...",
        type: "text",
        apiFunction: async (query, limit) => {
          try {
            const response = await fetch(
              `/admin/manage-db/field-data/synths?query=${encodeURIComponent(
                query
              )}&limit=${limit}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error);
            }

            return await response.json();
          } catch (err) {
            throw new Error(`Failed to fetch autofill results: ${err.message}`);
          }
        },
      },
    ],
    lists: [],
  },
  synths: {
    id: "synth_id",
    label: "Synth",
    apiEndpoint: "/admin/manage-db/synth-data/",
    title: "Edit Synth",
    hasEntryPage: true,
    fields: [
      {
        key: "synth_id",
        label: "Synth ID:",
        type: "text",
      },
      {
        key: "synth_timestamp",
        label: "Added:",
        type: "text",
      },
      {
        key: "synth_id",
        label: "View synth page",
        type: "link",
        href: "/synth/",
      },
    ],
    inputs: [
      {
        key: "synth_name",
        label: "Synth Name",
        placeholder: "Synth Name",
        type: "text",
      },
      {
        key: "synth_manufacturer",
        label: "Synth Manufacturer",
        placeholder: "Synth Manufacturer",
        type: "text",
      },
      {
        key: "synth_type",
        label: "Synth Type",
        placeholder: "Synth Type",
        type: "text",
      },
      {
        key: "synth_release_year",
        label: "Release Year",
        placeholder: "Release Year",
        type: "text",
      },
    ],
    fileUploads: [
      {
        type: "image",
        key: "synth_image",
        label: "Synth Image",
      },
    ],
    dropdownSelectors: [],
    lists: [
      {
        key: "presets",
        label: "Presets",
        dataFields: {
          id: "id",
          primary: "name",
          numColumns: 1,
        },
        placeholder: "Search for preset...",
        apiFunction: async (query, limit) => {
          try {
            const response = await fetch(
              `/admin/manage-db/field-data/presets?query=${encodeURIComponent(
                query
              )}&limit=${limit}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error);
            }

            return await response.json();
          } catch (err) {
            throw new Error(`Failed to fetch autofill results: ${err.message}`);
          }
        },
      },
    ],
  },
};

class DBTableDataManager {
  static async fetchTableData(table, sortKey = "", sortDirection = "") {
    try {
      const response = await fetch(
        `/admin/manage-db/table-data/${encodeURIComponent(
          table
        )}?sortKey=${encodeURIComponent(
          sortKey
        )}&sortDirection=${encodeURIComponent(sortDirection)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return await response.json();
    } catch (err) {
      throw new Error(`Failed to get table data: ${err.message}`);
    }
  }
}

class DBCSVExportManager {
  static bindCSVExportButton({
    buttonElement,
    viewManager,
    rowSelector = "span",
    entrySelector = ".db-entry",
    delimiter = ",",
    quote = '"',
  }) {
    const csvManager = new Components.DBTableCSVDownloadManager(
      delimiter,
      quote
    );

    buttonElement.addEventListener("click", () => {
      const currentTable = viewManager.currentTable;
      const listContainer = viewManager.listContainer;

      if (!currentTable) {
        console.warn("No table selected to export.");
        return;
      }

      const tableRows = listContainer.querySelectorAll(entrySelector);
      if (tableRows.length === 0) {
        console.warn("No data to export.");
        return;
      }

      const csvData = csvManager.generateCSVData(tableRows, rowSelector);
      const fileName = `${currentTable}.csv`;
      csvManager.downloadCSVData(csvData, fileName);
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const staticDomManager = new Components.DBPageDOMManager({
    container: ".content-wrapper",
    pageContent: ".container",
    listContainer: ".entry-list--container",
    tableSelect: ".manage-db--table-select",
    sortSelect: ".manage-db--sort-select",
    filterInput: ".manage-db-filter--input",
    filterClearBtn: ".result-filter--clear",
    sortToggleBtn: ".sort-icon",
    csvExportBtn: ".download-icon",
  });

  const dbPageStateManager = new Components.DBMultiStateManager({
    defaultTable: "songs",
    tableURLIndex: 3,
    baseURL: "/admin/manage-db",
    saveTableInSession: true,
    sessionStorageKey: "db_current_table",
  });

  const dbViewManager = new Components.DBMultiViewManager({
    config: TABLE_CONFIG,
    fetchTableData: DBTableDataManager.fetchTableData,
    listContainer: staticDomManager.getElement("listContainer"),
    tableOptions: {
      renderHeaderNumberColumn: true,
      headerNumberColumnTextContent: "#",
      renderRowNumber: true,
    },
  });

  const dbManager = new Components.DBMultiTableResultsManager({
    staticDomManager: staticDomManager,
    viewManager: dbViewManager,
    pageStateManager: dbPageStateManager,
    tableSelectElement: staticDomManager.getElement("tableSelect"),
    updateURL: true,
    saveTableInSession: true,
    tableConfig: TABLE_CONFIG,
    sortingEnabled: true,
    sortOptions: {
      selectElement: staticDomManager.getElement("sortSelect"),
      toggleButton: staticDomManager.getElement("sortToggleBtn"),
    },
    filterEnabled: true,
    filterOptions: {
      filterInputElement: staticDomManager.getElement("filterInput"),
      filterClearBtnElement: staticDomManager.getElement("filterClearBtn"),
    },
  });

  dbManager.init();

  DBCSVExportManager.bindCSVExportButton({
    buttonElement: staticDomManager.getElement("csvExportBtn"),
    viewManager: dbViewManager,
    rowSelector: "span",
    entrySelector: ".db-entry",
    delimiter: ",",
    quote: '"',
  });

  new Components.PageLoadSpinnerManager({
    container: staticDomManager.getElement("container"),
    pageContent: staticDomManager.getElement("pageContent"),
    primaryColor: "#5A7F71",
    secondaryColor: "#e3e5e4",
    spinnerStrokeSize: "0.4rem",
    spinnerSpeed: 1.5,
    loadDelay: 100,
  });
});
