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
        key: "album",
        dataFields: ["title", "id"],
        label: "Album",
        placeholder: "Album Name",
        type: "text",
      },
    ],
    lists: [
      {
        key: "artists",
        label: "Artists",
        dataFields: ["name", "role"],
      },
      {
        key: "presets",
        label: "Presets",
        dataFields: ["name", "usage_type"],
      },
    ],
  },
};

class DBSlideoutManager {
  // API Methods
  async #getEntryData() {
    try {
      const response = await fetch(
        `${this.slideoutConfig[this.entryType].apiEndpoint}${this.entryId}`,
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
      throw new Error(
        `Failed to get data. Type: ${this.entryType} Error: ${err.message}`
      );
    }
  }

  #hintTimeout;

  constructor(config, entryType) {
    this.entryType = entryType;
    this.entryId = null;
    this.entryData = null;
    this.eventListenersBound = false;
    this.slideoutConfig = config;

    this.handleClose = this.handleClose.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleApplyChanges = this.handleApplyChanges.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleRemoveListEntry = this.handleRemoveListEntry.bind(this);
    this.handleAddListEntry = this.handleAddListEntry.bind(this);
    this.handleDropdownInput = this.handleDropdownInput.bind(this);
    this.handleDropdownClick = this.handleDropdownClick.bind(this);
  }

  async init(entryId) {
    try {
      await this.loadEntry(entryId);
      await this.initDOMReferences();

      await this.renderSlideoutTitle();
      await this.renderSlideoutContent();
      await this.initDynamicDOMReferences();

      await this.bindEvents();
    } catch (err) {
      console.error(`Failed to initialize DBSlideoutManager: ${err.message}`);
      throw err;
    }
  }

  async loadEntry(entryId) {
    try {
      this.entryId = entryId;
      this.entryData = await this.#getEntryData();
    } catch (err) {
      throw err;
    }
  }

  async initDOMReferences() {
    // Slideout Elements
    this.slideout = document.getElementById("slideout-panel");
    this.slideoutBackdrop = document.getElementById("slideout-backdrop");
    this.slideoutTitle = document.getElementById("slideout-title");
    this.slideoutCloseBtn = document.getElementById("slideout-close-btn");

    // Sections
    this.slideoutContentSection = document.getElementById("slideout-content");
    this.entryInfoContainer = document.querySelector(
      ".slideout-entry-info-container"
    );
    this.entryInfoTopContainer = document.querySelector(
      ".slideout-entry-info-top-container"
    );
    this.entryInfoInputContainer = document.querySelector(
      ".slideout-entry-info-input-container"
    );
    this.actionsContainer = document.getElementById("slideout-actions");
    this.actionsBtnsContainer = document.getElementById(
      "slideout-actions-btns"
    );
  }

  async initDynamicDOMReferences() {
    // Inputs
    this.inputELs = this.slideoutContentSection.querySelectorAll(
      ".slideout-entry-info-input"
    );

    // Buttons
    this.applyChangesBtn = this.slideoutContentSection.querySelector(
      ".slideout-apply-changes-btn"
    );
    this.deleteBtn = this.slideoutContentSection.querySelector(
      ".slideout-delete-btn"
    );

    this.removeBtns = this.slideoutContentSection.querySelectorAll(
      ".slideout-list-remove-btn"
    );
    this.addBtns = this.slideoutContentSection.querySelectorAll(
      ".slideout-list-add-btn"
    );
  }

  async resetSlideoutSections() {
    this.entryInfoTopContainer.innerHTML = "";
    this.entryInfoInputContainer.innerHTML = "";
    this.actionsBtnsContainer.innerHTML = "";
  }

  async renderSlideoutTitle() {
    this.slideoutTitle.textContent = this.slideoutConfig[this.entryType].title;
  }

  async renderSlideoutContent() {
    // Reset sections
    await this.resetSlideoutSections();

    // Top Section
    const fields = this.slideoutConfig[this.entryType].fields;

    fields.forEach((field, i) => {
      const fieldIsLink = field.type === "link";

      const fieldEntry = document.createElement("div");
      fieldEntry.className = "slideout-entry-info-top-entry";

      if (fieldIsLink) {
        const fieldLink = document.createElement("a");
        fieldLink.className = "slideout-entry-info-top-link";
        fieldLink.href = `${field.href}${this.entryData[field.key]}`;
        fieldLink.textContent = field.label;

        const fieldLinkIcon = document.createElement("i");
        fieldLinkIcon.className =
          "fa-solid fa-arrow-up-right-from-square slideout-entry-info-open-icon";

        fieldEntry.appendChild(fieldLink);
        fieldEntry.appendChild(fieldLinkIcon);
      } else {
        const fieldLabel = document.createElement("span");
        fieldLabel.className = "slideout-entry-info-top-text";
        fieldLabel.innerHTML = `<strong>${field.label}</strong>`;

        const fieldValue = document.createElement("span");
        fieldValue.className = "slideout-entry-info-top-text";
        fieldValue.textContent = this.entryData[field.key];

        fieldEntry.appendChild(fieldLabel);
        fieldEntry.appendChild(fieldValue);
      }

      this.entryInfoTopContainer.appendChild(fieldEntry);

      if (i < fields.length - 1) {
        const bulletEntry = document.createElement("div");
        bulletEntry.className = "slideout-entry-info-top-entry";

        bulletEntry.innerHTML = `
        <span class="slideout-entry-info-top-text">
          <strong>&bull;</strong>
        </span>`;

        this.entryInfoTopContainer.appendChild(bulletEntry);
      }
    });

    // Input Section
    const inputs = this.slideoutConfig[this.entryType].inputs;

    inputs.forEach((input) => {
      const inputLabel = document.createElement("span");
      inputLabel.className = "slideout-entry-info-text";
      inputLabel.textContent = input.label;

      const inputEl = document.createElement("input");
      inputEl.className = "slideout-entry-info-input";
      inputEl.type = input.type;
      inputEl.placeholder = input.placeholder;
      inputEl.name = input.key;
      inputEl.value = this.entryData[input.key];

      this.entryInfoInputContainer.appendChild(inputLabel);
      this.entryInfoInputContainer.appendChild(inputEl);
    });

    // File Upload Section
    const filesUploads = this.slideoutConfig[this.entryType].fileUploads;

    filesUploads.forEach((fileUpload) => {
      const inputLabel = document.createElement("span");
      inputLabel.className = "slideout-entry-info-text";
      inputLabel.textContent = fileUpload.label;

      if (fileUpload.type === "image") {
        const imgContainer = document.createElement("div");
        imgContainer.className = "slideout-img-container";

        const img = document.createElement("img");
        img.className = "slideout-img";
        img.alt = `${this.entryType} image`;
        img.src = this.entryData[fileUpload.key]
          ? `/uploads/images/approved/${this.entryData[fileUpload.key]}`
          : "/assets/images/image-upload-placeholder.webp";

        const inputWrapper = document.createElement("div");
        inputWrapper.className = "slideout-file-input-wrapper";
        inputWrapper.innerHTML = `
          <div class="slideout-custom-file-input">
            <button type="button" class="slideout-browse-button">
              Browse...
            </button>
            <span class="slideout-file-name">
              ${this.entryData[fileUpload.key] || "No file selected"}
            </span>
            <input
              type="file"
              class="slideout-img-input"
              accept="image/*"
              name="${fileUpload.key}"
            />
          </div>`;

        imgContainer.appendChild(img);
        imgContainer.appendChild(inputWrapper);
        this.entryInfoInputContainer.appendChild(inputLabel);
        this.entryInfoInputContainer.appendChild(imgContainer);
      } else {
        // ...
      }
    });

    // Dropdowns Section
    const dropdownSelectors =
      this.slideoutConfig[this.entryType].dropdownSelectors;

    dropdownSelectors.forEach((selector) => {
      const selectorLabel = document.createElement("span");
      selectorLabel.className = "slideout-entry-info-text";
      selectorLabel.textContent = selector.label;

      const selectorContainer = document.createElement("div");
      selectorContainer.className = "slideout-selector-container";

      const selectorText = document.createElement("span");
      selectorText.className = "slideout-selector-text";
      selectorText.textContent =
        this.entryData[selector.key][selector.dataFields[0]];

      const dropdownContainer = document.createElement("div");
      dropdownContainer.className = "slideout-dropdown-container";

      const selectorFilterInput = document.createElement("input");
      selectorFilterInput.className = "slideout-selector-input hidden";
      selectorFilterInput.type = "text";
      selectorFilterInput.placeholder = selector.placeholder;
      selectorFilterInput.name = selector.key;
      selectorFilterInput.value =
        this.entryData[selector.key][selector.dataFields[0]];

      const divider = document.createElement("div");
      divider.className = "slideout-selector-divider";

      const dropdownList = document.createElement("ul");
      dropdownList.className = "slideout-dropdown hidden";
      dropdownList.id = `slideout-dropdown-${selector.key}`;

      dropdownContainer.appendChild(selectorFilterInput);
      dropdownContainer.appendChild(divider);
      dropdownContainer.appendChild(dropdownList);

      selectorContainer.appendChild(selectorText);
      selectorContainer.appendChild(dropdownContainer);

      this.entryInfoInputContainer.appendChild(selectorLabel);
      this.entryInfoInputContainer.appendChild(selectorContainer);
    });

    // Lists Section
    const listInputs = this.slideoutConfig[this.entryType].lists;

    listInputs.forEach((list) => {
      const listData = this.entryData[list.key];
      const dataFields = list.dataFields;

      const inputLabel = document.createElement("span");
      inputLabel.className = "slideout-entry-info-text";
      inputLabel.textContent = list.label;

      const listContainer = document.createElement("div");
      listContainer.className = "slideout-list-container";

      listData.forEach((data) => {
        const listEntry = document.createElement("div");
        listEntry.className = `slideout-list-entry--${dataFields.length}`;
        listEntry.id = `slideout-list-entry-${data.id}`;

        dataFields.forEach((field) => {
          const listEntryTextWrapper = document.createElement("div");
          listEntryTextWrapper.className = "slideout-list-entry-text-wrapper";
          const listEntryText = document.createElement("span");
          listEntryText.className = "slideout-list-entry-text";
          listEntryText.textContent = data[field];
          listEntryTextWrapper.appendChild(listEntryText);
          listEntry.appendChild(listEntryTextWrapper);
        });

        const removeBtn = document.createElement("button");
        removeBtn.className = "hidden-btn slideout-list-remove-btn";
        removeBtn.innerHTML = `<i class="fa-solid fa-xmark slideout-remove-icon"></i>`;

        listEntry.appendChild(removeBtn);
        listContainer.appendChild(listEntry);
      });

      const addContainer = document.createElement("div");
      addContainer.className = "slideout-list-add-container";

      const addBtn = document.createElement("button");
      addBtn.className = "hidden-btn slideout-list-add-btn";
      addBtn.innerHTML = `<i class="fa-solid fa-plus slideout-add-icon"></i>`;

      const dropdownContainer = document.createElement("div");
      dropdownContainer.className = "slideout-list-dropdown-container hidden";

      const inputEl = document.createElement("input");
      inputEl.className = "slideout-list-input dropdown-input";
      inputEl.type = "text";
      inputEl.placeholder = `Add new ${list.label}`;
      inputEl.name = list.key;

      const dropdownList = document.createElement("ul");
      dropdownList.className = "slideout-dropdown";
      dropdownList.id = `slideout-dropdown-${list.key}`;

      dropdownContainer.appendChild(inputEl);
      dropdownContainer.appendChild(dropdownList);
      addContainer.appendChild(addBtn);
      addContainer.appendChild(dropdownContainer);
      listContainer.appendChild(addContainer);

      this.entryInfoInputContainer.appendChild(inputLabel);
      this.entryInfoInputContainer.appendChild(listContainer);
    });

    // Apply Changes Btn
    const applyChangesBtnEl = document.createElement("button");
    applyChangesBtnEl.type = "button";
    applyChangesBtnEl.className = "slideout-apply-changes-btn";
    applyChangesBtnEl.disabled = true;
    applyChangesBtnEl.textContent = "Apply Changes";

    this.entryInfoInputContainer.appendChild(applyChangesBtnEl);

    // Delete Btn
    const deleteBtnEl = document.createElement("button");
    deleteBtnEl.type = "button";
    deleteBtnEl.className = "slideout-delete-btn";
    deleteBtnEl.textContent = `Delete ${
      this.slideoutConfig[this.entryType].label
    }`;

    this.actionsBtnsContainer.appendChild(deleteBtnEl);
  }

  // Event Listeners
  async handleClose() {
    this.close();
  }

  async handleInput(inputEl) {
    let inputsFilled = true;
    for (const input of this.inputELs) {
      if (input.value.trim().length === 0) {
        inputsFilled = false;
        break;
      }
    }

    this.applyChangesBtn.disabled = !inputsFilled;
    // dropdown
  }

  async handleApplyChanges() {
    try {
      // ...
    } catch (err) {
      // show visual error hint
      console.error(err);
    }
  }

  async handleDelete() {
    console.log(this.entryId);
  }

  async handleRemoveListEntry(listEntry) {
    console.log(listEntry);
  }

  async handleAddListEntry(listContainer) {
    // ...
  }

  async handleDropdownInput(dropdownInput) {}

  async handleDropdownClick(dropdown) {}

  async bindEvents() {
    this.slideoutCloseBtn.addEventListener("click", this.handleClose);
    this.slideoutBackdrop.addEventListener("click", this.handleClose);
    this.applyChangesBtn.addEventListener("click", this.handleApplyChanges);
    this.deleteBtn.addEventListener("click", this.handleDelete);

    this.inputELs.forEach((inputEl) => {
      inputEl.addEventListener("input", (e) => {
        this.handleInput(e.target);
      });
    });

    this.removeBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const listEntry = e.target.closest(".slideout-list-entry");
        if (listEntry) {
          this.handleRemoveListEntry(listEntry);
        }
      });
    });

    this.addBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const listContainer = e.target.closest(".slideout-list-container");
        if (listContainer) {
          this.handleAddListEntry(listContainer);
        }
      });
    });
  }

  disableApplyChangesBtn() {
    this.applyChangesBtn.disabled = true;
  }

  show() {
    this.slideout.classList.remove("hidden");
    this.slideoutBackdrop.classList.remove("hidden");
  }

  close() {
    this.slideout.classList.add("hidden");
    this.slideoutBackdrop.classList.add("hidden");
    this.disableApplyChangesBtn();
    // this.clearHints();
    // this.clearInputErrors();
  }
}

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

  #generateCSV(tableData) {
    const headers =
      Array.from(tableData[0].querySelectorAll("span"))
        .map((el) => el.textContent.trim())
        .join(",") + "\n";
    const rows = Array.from(tableData)
      .map((row) => {
        return Array.from(row.querySelectorAll("span"))
          .map((el) => `"${el.textContent.trim()}"`)
          .join(",");
      })
      .join("\n");
    return headers + rows;
  }

  #downloadCSV(content, filename) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  constructor(config) {
    this.config = config;
    this.currentTable = null;
    this.listContainer = document.querySelector(".entry-list--container");
    this.exportBtn = document.querySelector(".download-icon");

    this.exportBtn.addEventListener("click", () => {
      if (!this.currentTable) {
        console.error("No table loaded.");
        return;
      }

      const tableData = this.listContainer.querySelectorAll(".db-entry");
      if (tableData.length === 0) {
        console.warn("No data to export.");
        return;
      }

      const csvContent = this.#generateCSV(tableData);
      this.#downloadCSV(csvContent, `${this.currentTable}.csv`);
    });
  }

  async loadTable(table) {
    try {
      const tableConfig = this.config[table];
      if (!tableConfig) {
        throw new Error(`Unknown table: ${table}`);
      }

      const tableData = await this.#getTableData(table);

      this.listContainer.innerHTML = "";
      await this.renderTableHeader(table, tableConfig.columns);
      await this.renderTableRows(table, tableData, tableConfig);
      this.currentTable = table;
    } catch (err) {
      console.error(`Failed to load table: ${err.message}`);
      throw err;
    }
  }

  async renderTableHeader(table, columns) {
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

  async renderTableRows(table, tableData, tableConfig) {
    tableData.forEach((row, i) => {
      const rowEl = document.createElement("div");
      rowEl.className = `grid-layout--${table} db-entry`;

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
      editBtn.addEventListener("click", async () => {
        const slideout = new DBSlideoutManager(SLIDEOUT_CONFIG, table);
        try {
          await slideout.init(row[tableConfig.id]);
          slideout.show();
        } catch (err) {
          console.error(`Failed to open slideout: ${err.message}`);
        }
      });
      rowEl.appendChild(editBtn);

      this.listContainer.appendChild(rowEl);
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  setTableSelect();

  const loadSelectedTable = async (updateURL = true) => {
    const selectedTable = tableSelect.value;
    sessionStorage.setItem("manageDBTableSelected", selectedTable);

    if (updateURL) {
      const newUrl = `/admin/manage-db/${selectedTable}`;
      history.pushState({ table: selectedTable }, "", newUrl);
    }

    try {
      await dbViewManager.loadTable(selectedTable);
    } catch (err) {
      console.error(`Error loading table: ${err.message}`);
    }
  };

  const dbViewManager = new DBViewManager(TABLE_CONFIG);

  const defaultTable = "songs";
  const initialTable =
    window.location.pathname.split("/")[3] ||
    sessionStorage.getItem("manageDBTableSelected") ||
    defaultTable;

  tableSelect.value = initialTable;

  await dbViewManager.loadTable(initialTable);

  tableSelect.addEventListener("change", () => loadSelectedTable(true));

  window.addEventListener("popstate", async (e) => {
    const pathTable = window.location.pathname.split("/")[3] || defaultTable;
    tableSelect.value = pathTable;
    await dbViewManager.loadTable(pathTable);
  });

  await loadSelectedTable();
});
