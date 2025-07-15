const tableSelect = document.querySelector(".manage-db--table-select");

/* ------------------------- Setting values on load ------------------------- */
const setTableSelect = function () {
  const selectedTable =
    sessionStorage.getItem(`manageDBTableSelected`) || "songs";
  tableSelect.value = selectedTable;
};

/* -------------------------------- Dropdown -------------------------------- */
class AutofillDropdownManager {
  #input;
  #dropdown;
  #onSelectCallback;
  #limit;
  #shouldAutofillInput;
  #fetchResults;
  #hideDropdownOnClickOff;
  #debounceDelay;
  #classes;
  #selectedIndex;
  #debounceTimeout;
  #loopNavigation;

  constructor(options) {
    const {
      fetchResults,
      inputElement,
      dropdownElement,
      onSelectCallback = null,
      resultsLimit = null,
      shouldAutofillInput = true,
      hideDropdownOnClickOff = true,
      loopNavigation = true,
      debounceDelay = 150,
      classes = {},
    } = options;
    if (!(inputElement instanceof HTMLInputElement)) {
      throw new Error("Input must be an HTMLInputElement.");
    }

    if (!(dropdownElement instanceof HTMLElement)) {
      throw new Error("Dropdown must be an HTMLElement.");
    }

    if (typeof fetchResults !== "function") {
      throw new Error("Invalid fetchResults function.");
    }

    const defaultClasses = {
      show: "show",
      hidden: "hidden",
      selected: "selected",
    };

    this.#classes = {
      ...defaultClasses,
      ...classes,
    };
    this.#input = inputElement;
    this.#dropdown = dropdownElement;
    this.#onSelectCallback = onSelectCallback;
    this.#limit = resultsLimit;
    this.#shouldAutofillInput = shouldAutofillInput;
    this.#fetchResults = fetchResults;
    this.#hideDropdownOnClickOff = hideDropdownOnClickOff;
    this.#loopNavigation = loopNavigation;
    this.#debounceDelay = debounceDelay;
    this.#selectedIndex = -1;
    this.#debounceTimeout = null;

    this.#bindEvents();
  }

  get dropdownElement() {
    return this.#dropdown;
  }

  destroy() {
    this.#unbindEvents();
  }

  async #fetchAutofillResults(query) {
    try {
      return await this.#fetchResults(query, this.#limit);
    } catch (err) {
      throw new Error(`Failed to fetch autofill results: ${err.message}`);
    }
  }

  async #handleKeyboardNavigation(e) {
    const dropdownItems = this.#dropdown.querySelectorAll("li");

    if (!dropdownItems.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (this.#selectedIndex < dropdownItems.length - 1) {
          this.#selectedIndex++;
        } else {
          this.#selectedIndex = this.#loopNavigation
            ? 0
            : dropdownItems.length - 1;
        }
        this.#updateDropdownSelection(dropdownItems);
        break;

      case "ArrowUp":
        e.preventDefault();
        if (this.#selectedIndex > 0) {
          this.#selectedIndex--;
        } else {
          this.#selectedIndex = this.#loopNavigation
            ? dropdownItems.length - 1
            : 0;
        }
        this.#updateDropdownSelection(dropdownItems);
        break;

      case "Enter":
        e.preventDefault();
        if (this.#selectedIndex >= 0 && dropdownItems[this.#selectedIndex]) {
          const selectedValue = dropdownItems[this.#selectedIndex].textContent;
          const selectedValueID =
            dropdownItems[this.#selectedIndex].getAttribute("data-id");
          this.#hideDropdown();
          this.#setInputValue(selectedValue);
          this.#selectedIndex = -1;
          if (this.#onSelectCallback) {
            await this.#onSelectCallback?.({
              label: selectedValue,
              id: selectedValueID,
            });
          }
        }
        break;

      case "Escape":
        this.#hideDropdown();
        this.#selectedIndex = -1;
        break;
    }
  }

  #updateDropdownSelection(dropdownItems) {
    dropdownItems.forEach((item) => {
      item.classList.remove(this.#classes.selected);
    });

    if (this.#selectedIndex >= 0 && dropdownItems[this.#selectedIndex]) {
      const selectedItem = dropdownItems[this.#selectedIndex];
      selectedItem.classList.add(this.#classes.selected);
      selectedItem.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }

  #handleInput() {
    clearTimeout(this.#debounceTimeout);
    this.#debounceTimeout = setTimeout(async () => {
      try {
        const query = this.#input.value.trim();

        if (!query.length) {
          this.#hideDropdown();
          return;
        }

        const results = await this.#fetchAutofillResults(query);
        this.#renderDropdown(results);
      } catch (err) {
        console.error("Error fetching autofill suggestions: ", err);
        throw err;
      }
    }, this.#debounceDelay);
  }

  #createDropdownItem({ label, id }) {
    const li = document.createElement("li");
    li.textContent = label;
    li.setAttribute("data-id", id);
    li.addEventListener("click", () => {
      this.#hideDropdown();
      this.#setInputValue(label);
      this.#onSelectCallback?.({ label, id });
    });
    return li;
  }

  #renderDropdown(dropdownItems) {
    if (!Array.isArray(dropdownItems)) {
      console.warn("Expected dropdownItems to be an array.");
      return;
    }

    this.#dropdown.innerHTML = "";
    if (!dropdownItems.length) {
      this.#hideDropdown();
      return;
    }

    const fragment = document.createDocumentFragment();
    dropdownItems.forEach((item) => {
      fragment.appendChild(this.#createDropdownItem(item));
    });

    this.#dropdown.appendChild(fragment);
    this.#showDropdown();
  }

  #hideDropdown() {
    this.#dropdown.classList.remove(this.#classes.show);
    this.#dropdown.classList.add(this.#classes.hidden);
  }

  #showDropdown() {
    this.#dropdown.classList.add(this.#classes.show);
    this.#dropdown.classList.remove(this.#classes.hidden);
  }

  #setInputValue(value) {
    if (!this.#shouldAutofillInput) return;
    this.#input.value = value;
    this.#input.dispatchEvent(new Event("input"));
  }

  #handleOutsideClicks(e) {
    if (!this.#input.contains(e.target) && !this.#dropdown.contains(e.target)) {
      this.#hideDropdown();
    }
  }

  #bindEvents() {
    this.handleInput = this.#handleInput.bind(this);
    this.handleOutsideClicks = this.#handleOutsideClicks.bind(this);
    this.handleKeydown = (e) => this.#handleKeyboardNavigation(e);

    if (this.#hideDropdownOnClickOff) {
      document.addEventListener("click", this.handleOutsideClicks);
    }

    this.#input.addEventListener("keydown", this.handleKeydown);
    this.#input.addEventListener("input", this.handleInput);
  }

  #unbindEvents() {
    if (this.#hideDropdownOnClickOff) {
      document.removeEventListener("click", this.handleOutsideClicks);
    }

    this.#input.removeEventListener("keydown", this.handleKeydown);
    this.#input.removeEventListener("input", this.handleInput);
  }
}

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

class DBSlideoutManager {
  #hintTimeout;

  async #fetchEntryData() {
    const { apiEndpoint } = this.slideoutConfig[this.entryType];
    try {
      const response = await fetch(`${apiEndpoint}${this.entryId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error((await response.json()).error);
      return response.json();
    } catch (err) {
      throw new Error(
        `Fetch failed for type ${this.entryType}: ${err.message}`
      );
    }
  }

  constructor(config, entryType, onSaveCallback) {
    this.slideoutConfig = config;
    this.entryType = entryType;
    this.entryId = null;
    this.entryData = null;
    this.eventListenersBound = false;
    this.onSaveCallback = onSaveCallback;

    this.handleClose = this.#handleClose.bind(this);
    this.handleInput = this.#handleInput.bind(this);
    this.handleApplyChanges = this.#handleApplyChanges.bind(this);
    this.handleDelete = this.#handleDelete.bind(this);
  }

  async init(entryId) {
    try {
      this.entryId = entryId;
      this.entryData = await this.#fetchEntryData();
      this.#initStaticDOM();
      await this.#renderUI();
      this.#initDynamicDOM();
      this.#bindEvents();
    } catch (err) {
      console.error(`Failed to initialize slideout: ${err.message}`);
      throw err;
    }
  }

  #initStaticDOM() {
    const $ = (sel) => document.getElementById(sel);

    this.slideout = $("slideout-panel");
    this.backdrop = $("slideout-backdrop");
    this.titleEl = $("slideout-title");
    this.closeBtn = $("slideout-close-btn");
    this.content = $("slideout-content");
    this.topContainer = $("slideout-entry-info-top-container");
    this.inputContainer = $("slideout-entry-info-input-container");
    this.actions = $("slideout-actions");
    this.actionBtns = $("slideout-actions-btns");
  }

  #initDynamicDOM() {
    const qsa = (sel) => this.content.querySelectorAll(sel);
    const qs = (sel) => this.content.querySelector(sel);

    this.inputs = qsa(".slideout-entry-info-input, .slideout-list-entry-input");
    this.applyBtn = qs(".slideout-apply-changes-btn");
    this.deleteBtn = qs(".slideout-delete-btn");
    this.removeBtns = qsa(".slideout-list-remove-btn");
    this.addBtns = qsa(".slideout-list-add-btn, .slideout-selector-add-btn");
    this.dropdownSelectors = qsa(".slideout-selector-container");
    this.dropdownContainers = qsa(".slideout-dropdown-container");
    this.imageInputs = qsa(".slideout-img-input");
    this.hint = qs(".slideout-hint");
  }

  close() {
    this.#scrollToTop();
    document.documentElement.classList.remove("scroll-lock");
    this.slideout.classList.add("hidden");
    this.backdrop.classList.add("hidden");
    this.#disableApplyBtn();
    this.#clearHint();
    this.#clearInputErrors();
    this.destroy();
  }

  show() {
    document.documentElement.classList.add("scroll-lock");
    this.slideout.classList.remove("hidden");
    this.backdrop.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  #showHint(msg, type) {
    this.#clearHint();
    this.hint.classList.remove("hidden");
    this.hint.textContent = msg;
    this.hint.classList.add(
      type === "success" ? "slideout-hint--success" : "slideout-hint--error"
    );

    if (this.#hintTimeout) clearTimeout(this.#hintTimeout);
    this.#hintTimeout = setTimeout(() => this.#clearHint(), 5000);
  }

  #clearHint() {
    this.hint.classList.add("hidden");
    this.hint.textContent = "";
    this.hint.classList.remove(
      "slideout-hint--error",
      "slideout-hint--success"
    );
  }

  #clearInputErrors() {
    this.inputs.forEach((input) =>
      input.classList.remove("slideout-input--error")
    );
  }

  #disableApplyBtn() {
    if (this.applyBtn) this.applyBtn.disabled = true;
  }

  #normalizeText(str) {
    return str
      ? str
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "";
  }

  async #renderUI() {
    this.#renderTitle();
    await this.#renderTopInfo();
    await this.#renderInputs();
    await this.#renderFileUploads();
    await this.#renderDropdownSelectors();
    await this.#renderLists();
    this.#renderApplyButton();
    this.#renderDeleteButton();
  }

  #renderTitle() {
    const { title } = this.slideoutConfig[this.entryType];
    this.titleEl.textContent = title;
  }

  async #renderTopInfo() {
    this.topContainer.innerHTML = "";
    const fields = this.slideoutConfig[this.entryType].fields;

    fields.forEach((field, i) => {
      const wrapper = document.createElement("div");
      wrapper.className = "slideout-entry-info-top-entry";

      if (field.type === "link") {
        const link = document.createElement("a");
        link.className = "slideout-entry-info-top-link";
        link.href = `${field.href}${this.entryData[field.key]}`;
        link.textContent = field.label;

        const icon = document.createElement("i");
        icon.className =
          "fa-solid fa-arrow-up-right-from-square slideout-entry-info-open-icon";

        wrapper.append(link, icon);
      } else {
        const label = document.createElement("span");
        label.className = "slideout-entry-info-top-text";
        label.innerHTML = `<strong>${field.label}</strong>`;

        const value = document.createElement("span");
        value.className = "slideout-entry-info-top-text";
        value.textContent = this.entryData[field.key];

        wrapper.append(label, value);
      }

      this.topContainer.appendChild(wrapper);

      if (i < fields.length - 1) {
        const bullet = document.createElement("div");
        bullet.className = "slideout-entry-info-top-entry";
        bullet.innerHTML = `
          <span class="slideout-entry-info-top-text">
            <strong>&bull;</strong>
          </span>`;
        this.topContainer.appendChild(bullet);
      }
    });
  }

  async #renderInputs() {
    const inputDefs = this.slideoutConfig[this.entryType].inputs;
    inputDefs.forEach((def) => {
      const label = document.createElement("span");
      label.className = "slideout-entry-info-text";
      label.textContent = def.label;

      const input = document.createElement("input");
      input.className = "slideout-entry-info-input";
      input.type = def.type;
      input.placeholder = def.placeholder;
      input.name = def.key;
      input.value = this.entryData[def.key];

      this.inputContainer.append(label, input);
    });
  }

  async #renderFileUploads() {
    const uploads = this.slideoutConfig[this.entryType].fileUploads || [];

    uploads.forEach((def) => {
      const label = document.createElement("span");
      label.className = "slideout-entry-info-text";
      label.textContent = def.label;

      if (def.type === "image") {
        const container = document.createElement("div");
        container.className = "slideout-img-container";

        const img = document.createElement("img");
        img.className = "slideout-img";
        img.alt = `${this.entryType} image`;
        img.src = this.entryData[def.key]
          ? `/uploads/images/approved/${this.entryData[def.key]}`
          : "/assets/images/image-upload-placeholder.webp";

        const wrapper = document.createElement("div");
        wrapper.className = "slideout-file-input-wrapper";
        wrapper.innerHTML = `
          <div class="slideout-custom-file-input">
            <button type="button" class="slideout-browse-button">Browse...</button>
            <span class="slideout-file-name">
              ${this.entryData[def.key] || "No file selected"}
            </span>
            <input 
              type="file" 
              class="slideout-img-input" 
              accept="image/*" 
              name="${def.key}" 
            />
          </div>`;

        container.append(img, wrapper);
        this.inputContainer.append(label, container);
      }
    });
  }

  async #renderDropdownSelectors() {
    const defs = this.slideoutConfig[this.entryType].dropdownSelectors || [];

    defs.forEach((def) => {
      const label = document.createElement("span");
      label.className = "slideout-entry-info-text";
      label.textContent = def.label;

      const container = document.createElement("div");
      container.className = "slideout-selector-container";

      const textContainer = document.createElement("div");
      textContainer.className = "slideout-selector-text-container";

      const value = this.entryData[def.key] || {};
      const primary = value[def.dataFields[0]] || "None";
      const secondary = value[def.dataFields[1]] || "None";

      const text = document.createElement("span");
      text.className = "slideout-selector-text";
      text.setAttribute("data-id", secondary);
      text.textContent = primary;

      const icon = document.createElement("i");
      icon.className = "fa-solid fa-caret-down slideout-selector-icon";

      textContainer.append(text, icon);

      const dropdownContainer = document.createElement("div");
      dropdownContainer.className = "slideout-dropdown-container hidden";

      const input = document.createElement("input");
      input.className = "slideout-selector-filter-input";
      input.type = "text";
      input.placeholder = def.placeholder;
      input.name = def.key;

      const ul = document.createElement("ul");
      ul.className = "slideout-dropdown hidden";
      ul.id = `slideout-dropdown-${def.key}`;

      new AutofillDropdownManager({
        table: def.key,
        inputElement: input,
        dropdownElement: ul,
        resultsLimit: 7,
        shouldAutofillInput: false,
        onSelectCallback: ({ label, id }) => {
          text.textContent = label;
          text.setAttribute("data-id", id);
          this.#toggleDropdownContainer(textContainer, dropdownContainer);
        },
        fetchResults: def.apiFunction,
        hideDropdownOnClickOff: false,
      });

      textContainer.addEventListener("click", () => {
        input.value = "";
        input.dispatchEvent(new Event("input"));
        this.#toggleDropdownContainer(textContainer, dropdownContainer);
        input.focus();
      });

      const addWrap = document.createElement("div");
      addWrap.className = "slideout-dropdown-add-container";

      const addBtn = document.createElement("button");
      addBtn.className = "hidden-btn slideout-dropdown-add-btn";
      addBtn.innerHTML = `<i class="fa-solid fa-plus slideout-add-icon"></i>`;
      addBtn.addEventListener("click", () => {
        window.location.href = `/admin/manage-db/${def.key}`;
      });

      addWrap.appendChild(addBtn);
      const divider = document.createElement("div");
      divider.className = "slideout-dropdown-divider";

      dropdownContainer.append(input, ul, divider, addWrap);
      container.append(textContainer, dropdownContainer);

      this.inputContainer.append(label, container);
    });
  }

  #validateListsHaveItems() {
    const listContainers = this.content.querySelectorAll(
      ".slideout-list-container"
    );

    for (const container of listContainers) {
      const entries = container.querySelectorAll(
        ".slideout-list-entry--1, .slideout-list-entry--2"
      );
      if (entries.length === 0) return false;
    }

    return true;
  }

  async #renderLists() {
    const lists = this.slideoutConfig[this.entryType].lists || [];

    const createListEntry = (
      primary,
      secondary,
      id,
      secondaryPlaceholder,
      numColumns
    ) => {
      const entry = document.createElement("div");
      entry.className = `slideout-list-entry--${numColumns}`;
      entry.id = `slideout-list-entry-${id}`;

      const primaryWrapper = document.createElement("div");
      primaryWrapper.className = "slideout-list-entry-text-wrapper";
      const primaryText = document.createElement("span");
      primaryText.className = "slideout-list-entry-text";
      primaryText.textContent = primary;
      primaryWrapper.appendChild(primaryText);

      let secondaryWrapper = null;
      let secondaryInput = null;
      if (numColumns > 1) {
        secondaryWrapper = document.createElement("div");
        secondaryWrapper.className = "slideout-list-entry-text-wrapper";
        secondaryInput = document.createElement("input");
        secondaryInput.className = "slideout-list-entry-input";
        secondaryInput.type = "text";
        secondaryInput.value = secondary;
        secondaryInput.placeholder = secondaryPlaceholder;
        secondaryInput.addEventListener("input", this.handleInput);
        secondaryWrapper.appendChild(secondaryInput);
      }

      const removeBtn = document.createElement("button");
      removeBtn.className = "hidden-btn slideout-list-remove-btn";
      removeBtn.innerHTML = `<i class="fa-solid fa-xmark slideout-remove-icon"></i>`;
      removeBtn.addEventListener("click", () => {
        entry.remove();
        this.handleInput();
      });

      entry.append(primaryWrapper);
      if (secondaryWrapper) entry.append(secondaryWrapper);
      entry.append(removeBtn);
      return entry;
    };

    lists.forEach((list) => {
      const label = document.createElement("span");
      label.className = "slideout-entry-info-text";
      label.textContent = list.label;

      const listWrapper = document.createElement("div");
      listWrapper.className = "slideout-list-wrapper";
      const listContainer = document.createElement("div");
      listContainer.className = "slideout-list-container";

      const items = this.entryData[list.key] || [];
      const {
        id: idField,
        primary: primaryField,
        secondary: secondaryField,
        numColumns: numColumns,
      } = list.dataFields;

      items.forEach((item) => {
        const id = item[idField];
        const primary = item[primaryField];
        const secondary = item[secondaryField];
        const entry = createListEntry(
          primary,
          secondary,
          id,
          this.#normalizeText(secondaryField),
          numColumns
        );
        listContainer.appendChild(entry);
      });

      const addBtnWrap = document.createElement("div");
      addBtnWrap.className = "slideout-list-add-container";

      const addBtn = document.createElement("button");
      addBtn.className = "hidden-btn slideout-list-add-btn";
      addBtn.innerHTML = `<i class="fa-solid fa-plus slideout-add-icon"></i>`;
      addBtn.addEventListener("click", () => {
        input.value = "";
        input.dispatchEvent(new Event("input"));
        this.#toggleDropdownContainer(listContainer, dropdown);
        input.focus();
      });

      addBtnWrap.appendChild(addBtn);

      const dropdown = document.createElement("div");
      dropdown.className = "slideout-dropdown-container hidden";

      const input = document.createElement("input");
      input.className = "slideout-list-filter-input";
      input.type = "text";
      input.placeholder = list.placeholder;
      input.name = list.key;

      const ul = document.createElement("ul");
      ul.className = "slideout-dropdown hidden";
      ul.id = `slideout-dropdown-${list.key}`;

      new AutofillDropdownManager({
        table: list.key,
        inputElement: input,
        dropdownElement: ul,
        resultsLimit: 7,
        shouldAutofillInput: false,
        onSelectCallback: ({ label, id }) => {
          const newEntry = createListEntry(
            label,
            "",
            id,
            this.#normalizeText(secondaryField),
            numColumns
          );
          listContainer.insertBefore(newEntry, addBtnWrap);
          this.#toggleDropdownContainer(listContainer, dropdown);
        },
        fetchResults: list.apiFunction,
        hideDropdownOnClickOff: false,
      });

      dropdown.append(input, ul);
      listContainer.appendChild(addBtnWrap);
      listWrapper.appendChild(listContainer);
      listWrapper.appendChild(dropdown);
      this.inputContainer.append(label, listWrapper);
    });
  }

  #renderApplyButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slideout-apply-changes-btn";
    btn.disabled = true;
    btn.textContent = "Apply Changes";

    const hint = document.createElement("div");
    hint.className = "slideout-hint hidden";

    this.inputContainer.append(btn, hint);
  }

  #renderDeleteButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slideout-delete-btn";
    btn.textContent = `Delete ${this.slideoutConfig[this.entryType].label}`;
    this.actionBtns.appendChild(btn);
  }

  getInputValues() {
    const formData = new FormData();
    formData.append("id", this.entryId);

    this.inputs.forEach((input) => {
      if (input.classList.contains("slideout-list-entry-input")) return;
      formData.append(input.name, input.value.trim());
    });

    this.dropdownSelectors.forEach((selector) => {
      const key = selector.querySelector(
        ".slideout-selector-filter-input"
      ).name;
      const id = selector
        .querySelector(".slideout-selector-text")
        .getAttribute("data-id");
      formData.append(key, id ? parseInt(id) : "");
    });

    const lists = this.slideoutConfig[this.entryType].lists || [];
    lists.forEach((list) => {
      const container = this.content
        .querySelector(`#slideout-dropdown-${list.key}`)
        ?.closest(".slideout-list-wrapper");
      if (!container) return;

      const numColumns = list.dataFields.numColumns;

      const entries = container.querySelectorAll(
        `.slideout-list-entry--${numColumns}`
      );
      const result = [];

      entries.forEach((entry) => {
        const id = parseInt(entry.id.replace("slideout-list-entry-", ""));
        if (numColumns === 1) {
          result.push(id);
        } else {
          const value = entry
            .querySelector(".slideout-list-entry-input")
            .value.trim();
          result.push({
            [list.dataFields.id]: id,
            [list.dataFields.secondary]: value,
          });
        }
      });

      formData.append(list.key, JSON.stringify(result));
    });

    this.imageInputs.forEach((input) => {
      if (input.files.length > 0) {
        formData.append(input.name, input.files[0]);
      }
    });

    return formData;
  }

  #handleImgInputs() {
    const dispatchInputEvent = () => {
      this.inputs.forEach((input) => {
        input.dispatchEvent(new Event("input"));
      });
    };

    this.imageInputs.forEach((imageInput) => {
      imageInput.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onerror = function () {
          alert("Invalid image file.");
        };

        img.onload = () => {
          if (img.width < 1000 || img.height < 1000) {
            alert("Image must be at least 1000x1000 pixels.");
          } else {
            const fileNameDisplay = imageInput
              .closest(".slideout-custom-file-input")
              .querySelector(".slideout-file-name");

            fileNameDisplay.textContent = file.name;

            const imgDisplay = imageInput
              .closest(".slideout-img-container")
              .querySelector(".slideout-img");

            imgDisplay.onload = function () {
              URL.revokeObjectURL(img.src);
            };

            imgDisplay.src = img.src;

            dispatchInputEvent();
          }
        };
      });
    });
  }

  #bindEvents() {
    this.closeBtn.addEventListener("click", this.handleClose);
    this.backdrop.addEventListener("click", this.handleClose);
    this.applyBtn?.addEventListener("click", this.handleApplyChanges);
    this.deleteBtn?.addEventListener("click", this.handleDelete);

    this.inputs.forEach((input) =>
      input.addEventListener("input", this.handleInput)
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.#closeAllDropdownContainers();
        this.close();
      }
    });

    this.slideout.addEventListener("click", (event) => {
      const ignore = [
        ...this.dropdownSelectors,
        ...this.dropdownContainers,
        ...this.addBtns,
      ];
      if (!ignore.some((el) => el.contains(event.target))) {
        this.#closeAllDropdownContainers();
      }
    });

    this.#handleImgInputs();
  }

  #unbindEvents() {
    this.closeBtn.removeEventListener("click", this.handleClose);
    this.applyBtn.removeEventListener("click", this.handleApplyChanges);
    this.deleteBtn.removeEventListener("click", this.handleDelete);
    this.inputs.forEach((input) =>
      input.removeEventListener("input", this.handleInput)
    );
    this.eventListenersBound = false;
  }

  #scrollToTop() {
    this.slideout.scrollTop = 0;
  }

  destroy() {
    this.#unbindEvents();
    this.#clearHint();
    this.#clearInputErrors();
    this.entryId = null;
    this.entryData = null;
    this.topContainer.innerHTML = "";
    this.inputContainer.innerHTML = "";
    this.actionBtns.innerHTML = "";
  }

  #closeAllDropdownContainers() {
    this.dropdownSelectors.forEach((btn) => btn.classList.remove("show"));
    this.dropdownContainers.forEach((c) => c.classList.add("hidden"));
  }

  #toggleDropdownContainer(btn, container) {
    btn.classList.toggle("show");
    container.classList.toggle("hidden");
  }

  #handleInput() {
    this.inputs = this.content.querySelectorAll(
      ".slideout-entry-info-input, .slideout-list-entry-input"
    );

    const inputsFilled = [...this.inputs].every(
      (i) => i.value.trim().length > 0
    );
    const listsValid = this.#validateListsHaveItems();

    this.applyBtn.disabled = !(inputsFilled && listsValid);
  }

  async #updateEntry(apiEndpoint, formData) {
    try {
      const response = await fetch(apiEndpoint, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return await response.json();
    } catch (err) {
      throw new Error(`Failed to update entry: ${err.message}`);
    }
  }

  async #handleApplyChanges() {
    const formData = this.getInputValues();
    const { apiEndpoint } = this.slideoutConfig[this.entryType];

    try {
      const response = await this.#updateEntry(apiEndpoint, formData);

      if (!response) {
        this.#showHint("No response from server.", "error");
        return;
      }

      this.#showHint("Changes saved successfully.", "success");
      this.onSaveCallback?.();
      this.#disableApplyBtn();
    } catch (err) {
      console.error(err);
      this.#showHint("Failed to save changes.", "error");
    }
  }

  async #handleClose() {
    this.close();
  }

  async #handleDelete() {
    console.log("Delete", this.entryId);
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
        const slideout = new DBSlideoutManager(SLIDEOUT_CONFIG, table, () =>
          this.loadTable(table)
        );
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
