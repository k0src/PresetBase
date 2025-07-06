const tableSelect = document.querySelector(".manage-db--table-select");

/* ------------------------- Setting values on load ------------------------- */
const setTableSelect = function () {
  const selectedTable =
    sessionStorage.getItem(`manageDBTableSelected`) || "songs";
  tableSelect.value = selectedTable;
};

/* ------------------------------ Table Config ------------------------------ */
const TABLE_CONFIG = {
  songs: {
    title: "Song",
    id: "id",
    columns: [
      {
        key: "title",
        label: "Title",
        classname: "db-entry--primary song-title",
      },
      {
        key: "genre",
        label: "Genre",
        classname: "db-entry--primary song-genre",
      },
      {
        key: "release_year",
        label: "Release Year",
        classname: "db-entry--secondary song-year",
      },
      {
        key: "song_url",
        label: "Song URL",
        classname: "db-entry--secondary song-url",
      },
      {
        key: "image_url",
        label: "Image URL",
        classname: "db-entry--secondary song-image-url",
      },
      {
        key: "timestamp",
        label: "Added Date",
        classname: "db-entry--date song-added-date",
      },
    ],
    editFields: [
      { key: "title", placeholder: "Song Title" },
      { key: "genre", placeholder: "Song Genre" },
      { key: "release_year", placeholder: "Release Year" },
      { key: "song_url", placeholder: "Song URL" },
    ],
    // sort keys
  },

  artists: {
    title: "Artist",
    id: "id",
    columns: [
      {
        key: "name",
        label: "Name",
        classname: "db-entry--primary artist-name",
      },
      {
        key: "country",
        label: "Country",
        classname: "db-entry--secondary artist-country",
      },
      {
        key: "image_url",
        label: "Image URL",
        classname: "db-entry--secondary artist-image-url",
      },
      {
        key: "timestamp",
        label: "Added Date",
        classname: "db-entry--date artist-added-date",
      },
    ],
    editFields: [
      { key: "name", placeholder: "Artist Name" },
      { key: "country", placeholder: "Country" },
    ],
  },

  albums: {
    title: "Album",
    id: "id",
    columns: [
      {
        key: "title",
        label: "Title",
        classname: "db-entry--primary album-title",
      },
      {
        key: "genre",
        label: "Genre",
        classname: "db-entry--primary album-genre",
      },
      {
        key: "release_year",
        label: "Release Year",
        classname: "db-entry--secondary album-year",
      },
      {
        key: "image_url",
        label: "Image URL",
        classname: "db-entry--secondary album-image-url",
      },
      {
        key: "timestamp",
        label: "Added Date",
        classname: "db-entry--date album-added-date",
      },
    ],
    editFields: [
      { key: "title", placeholder: "Album Title" },
      { key: "genre", placeholder: "Album Genre" },
      { key: "release_year", placeholder: "Release Year" },
    ],
  },

  synths: {
    title: "Synth",
    id: "id",
    columns: [
      {
        key: "synth_name",
        label: "Synth Name",
        classname: "db-entry--primary synth-name",
      },
      {
        key: "manufacturer",
        label: "Manufacturer",
        classname: "db-entry--primary synth-manufacturer",
      },
      {
        key: "release_year",
        label: "Release Year",
        classname: "db-entry--secondary synth-year",
      },
      {
        key: "image_url",
        label: "Image URL",
        classname: "db-entry--secondary synth-image-url",
      },
      {
        key: "timestamp",
        label: "Added Date",
        classname: "db-entry--date synth-added-date",
      },
    ],
    editFields: [
      { key: "synth_name", placeholder: "Synth Name" },
      { key: "manufacturer", placeholder: "Manufacturer" },
      { key: "release_year", placeholder: "Release Year" },
    ],
  },

  presets: {
    title: "Preset",
    id: "id",
    columns: [
      {
        key: "preset_name",
        label: "Preset Name",
        classname: "db-entry--primary preset-name",
      },
      {
        key: "pack_name",
        label: "Pack Name",
        classname: "db-entry--secondary preset-pack-name",
      },
      {
        key: "author",
        label: "Author",
        classname: "db-entry--secondary preset-author",
      },
      {
        key: "timestamp",
        label: "Added Date",
        classname: "db-entry--date preset-added-date",
      },
    ],
  },
};

class DBSlideoutManager {}

class DBViewManager {
  // API Methods
  async #getTableData(table) {
    try {
      const response = await fetch(
        `/admin/manage-db/table-data/${encodeURIComponent(table)}`,
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

  constructor(slideout, config) {
    this.slideout = slideout;
    this.config = config;
    this.currentTable = null;
    this.listContainer = document.querySelector(".entry-list--container");
  }

  async loadTable(table) {
    try {
      const tableConfig = this.config[table];
      if (!tableConfig) {
        throw new Error(`Unknown table: ${table}`);
      }

      const tableData = await this.#getTableData(table);

      this.listContainer.innerHTML = "";
      this.renderTableHeader(table, tableConfig.columns);
      this.renderTableRows(table, tableData, tableConfig);
      this.currentTable = table;
    } catch (err) {
      console.error(`Failed to load table: ${err.message}`);
      throw err;
    }
  }

  renderTableHeader(table, columns) {
    const header = document.createElement("div");
    header.className = `result-columns grid-layout--${table}`;

    const numberColumn = document.createElement("span");
    numberColumn.textContent = "#";
    header.appendChild(numberColumn);

    for (const col of columns) {
      const column = document.createElement("span");
      column.textContent = col.label;
      header.appendChild(column);
    }
    this.listContainer.appendChild(header);
  }

  renderTableRows(table, tableData, tableConfig) {
    tableData.forEach((row, i) => {
      const rowEl = document.createElement("div");
      rowEl.className = `grid-layout--${table} db-entry`;
      rowEl.dataset.entryid = row[tableConfig.id];

      const numberColumn = document.createElement("span");
      numberColumn.className = "db-entry--number";
      numberColumn.textContent = i + 1;
      rowEl.appendChild(numberColumn);

      tableConfig.columns.forEach((column) => {
        const columnEl = document.createElement("span");
        columnEl.className = column.classname;
        columnEl.textContent = row[column.key];
        rowEl.appendChild(columnEl);
      });

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "hidden-btn";
      editBtn.innerHTML = `<i class="fa-solid fa-pen-to-square edit--icon"></i>`;
      // editBtn.onclick = Access the slideout instance here
      // editBtn.addEventListener("click", () => {
      //   this.slideout.openEditSlideout(table, row[tableConfig.id], tableConfig.editFields);
      // });
      rowEl.appendChild(editBtn);

      this.listContainer.appendChild(rowEl);
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  setTableSelect();

  const slideout = new DBSlideoutManager();
  const dbViewManager = new DBViewManager(slideout, TABLE_CONFIG);

  const loadSelectedTable = async () => {
    const selectedTable = tableSelect.value;
    sessionStorage.setItem("manageDBTableSelected", selectedTable);
    try {
      await dbViewManager.loadTable(selectedTable);
    } catch (err) {
      console.error(`Error loading table: ${err.message}`);
    }
  };

  tableSelect.addEventListener("change", loadSelectedTable);

  // Initial load
  tableSelect.value =
    sessionStorage.getItem("manageDBTableSelected") || "songs";
  await loadSelectedTable();
});
