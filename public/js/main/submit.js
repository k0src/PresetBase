import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/dist/fuse.mjs";

/* ---------------------------- Reload selection ---------------------------- */
const handleInputSelections = function () {
  handleImgInputs();
  handleAudioInputs();
  handleAutofillInputs();
};

/* ----------------------------- Single checkbox ---------------------------- */
const singleCheckBox = document.getElementById("singleCheckBox");
const albumSingleInput = document.querySelector('input[name="single"]');
const albumFields = document.querySelectorAll(".album-field");

singleCheckBox.addEventListener("change", () => {
  const isChecked = singleCheckBox.checked;

  albumSingleInput.value = isChecked ? "yes" : "no";

  albumFields.forEach((field) => {
    const fileInputField = field.closest(".custom-file-input");

    if (isChecked) {
      field.removeAttribute("required");
      field.setAttribute("disabled", "true");
      if (fileInputField) fileInputField.classList.add("disabled");
    } else {
      field.setAttribute("required", "true");
      field.removeAttribute("disabled");
      if (fileInputField) fileInputField.classList.remove("disabled");
    }
  });
});

/* ------------------------------- Add Artist ------------------------------- */
document.querySelector(".add-artist-btn").addEventListener("click", () => {
  const artistSection = document.getElementById("artistSection");

  const artistIndex = artistSection.querySelectorAll(".artist-entry").length;

  const newArtist = document.createElement("div");
  newArtist.classList.add("artist-entry");
  newArtist.innerHTML = `
    <hr class="hr--sep" />
    <div class="artist-entry--new-header">
    <span class="artist-entry--new-text"
        >Additional Artist</span
    >
    <div class="artist-entry-delete--btn">
        <i
        class="fa-solid fa-xmark artist-entry-delete--icon"
        ></i>
    </div>
    </div>
    <label
    >Artist Name <span class="red">*</span>
    <input
        class="form-input"
        required
        type="text"
        name="artists[${artistIndex}][name]"                      
        autocomplete="off"
        data-key="artistName"
      />
    <ul class="autocomplete-dropdown hidden"></ul>
    <small>Enter the name of the artist.</small>
    </label>
    <label
    >Artist Country <span class="red">*</span>
    <input
        class="form-input"
        required
        type="text"
        name="artists[${artistIndex}][country]"                      
        autocomplete="off"
        data-key="artistCountry"
      />
    <ul class="autocomplete-dropdown hidden"></ul>
    <small>Specify the artist's country of origin.</small>
    </label>
    <label
    >Artist role <span class="red">*</span>
    <input
        class="form-input"
        required
        type="text"
        name="artists[${artistIndex}][role]"                      
        autocomplete="off"
        data-key="artistRole"
      />
    <ul class="autocomplete-dropdown hidden"></ul>
    <small
        >State the artist's role on the track. Use 'Main' for
        primary artist. Enter only one role.</small
    >
    </label>
    <label>
    Artist Image <span class="red">*</span>

    <div class="custom-file-input">
        <button type="button" class="browse-button">
        Browse...
        </button>
        <span class="file-name">No file selected.</span>
        <input
        required
        type="file"
        name="artists[${artistIndex}][artistImg]"
        class="imageInput"
        accept="image/*"
        />
    </div>

    <small
        >Upload the artist's image. Leave blank to default to the
        album cover. Minimum dimensions: 1000 x 1000
        pixels.</small
    >
    </label>
    `;

  artistSection.insertBefore(
    newArtist,
    document.querySelector(".add-artist-btn")
  );

  handleInputSelections();
});

/* -------------------------------- Add synth ------------------------------- */
document.querySelector(".add-synth-btn").addEventListener("click", () => {
  const synthPresetSection = document.getElementById("synthPresetSection");

  const synthIndex = synthPresetSection.querySelectorAll(".synth-entry").length;

  const newSynth = document.createElement("div");
  newSynth.classList.add("synth-entry");
  newSynth.dataset.synthIndex = synthIndex;

  newSynth.innerHTML = `
    <div class="synth-entry--new-header">
    <span class="synth-entry--new-text"
        >Additional Synth</span
    >
    <div class="synth-entry-delete--btn">
        <i
        class="fa-solid fa-xmark synth-entry-delete--icon"
        ></i>
    </div>
    </div>
    <label
    >Synth Name <span class="red">*</span>
    <input
        class="form-input"
        required
        type="text"
        name="synths[${synthIndex}][name]"                      
        autocomplete="off"
        data-key="synthName"
      />
    <ul class="autocomplete-dropdown hidden"></ul>
    <small>Name the synth used in the track.</small>
    </label>
    <label
    >Manufacturer <span class="red">*</span>
    <input
        class="form-input"
        required
        type="text"
        name="synths[${synthIndex}][manufacturer]"                      
        autocomplete="off"
        data-key="synthManufacturer"
    />
    <ul class="autocomplete-dropdown hidden"></ul>
    <small
        >Provide the manufacturer or developer (e.g.,
        Spectrasonics).</small
    >
    </label>
    <label
    >Release Year <span class="red">*</span>
    <input
        class="form-input"
        pattern="^(19|20)\d{2}$"
        required
        type="number"
        name="synths[${synthIndex}][year]"
    />
    <small>Enter the synth's release year.</small>
    </label>
    <label
    >Type <span class="red">*</span>
    <select required name="synths[${synthIndex}][type]">
        <option value="VST">VST</option>
        <option value="Hardware">Hardware</option>
        <option value="Kontakt Bank">Kontakt Bank</option>
        <option value="SoundFont">SoundFont</option>
    </select>
    <small>Select the synth format.</small>
    </label>
    <label>
    Synth Image <span class="red">*</span>
    <div class="custom-file-input">
        <button type="button" class="browse-button">
        Browse...
        </button>
        <span class="file-name">No file selected.</span>
        <input
        required
        type="file"
        name="synths[${synthIndex}][img]"
        class="imageInput"
        accept="image/*"
        />
    </div>
    <small
        >Upload an image of the synth. Minimum dimensions: 1000 x
        1000 pixels.</small
    >
    </label>

    <div class="preset-section">
    <div class="preset-entry">
        <label
        >Preset Name <span class="red">*</span>
        <input
            class="form-input"
            required
            type="text"
            name="synths[${synthIndex}][presets][0][name]"                          
            autocomplete="off"
            data-key="presetName"
        />
        <ul class="autocomplete-dropdown hidden"></ul>
        <small
            >Enter the full name of the exact preset used (e.g., 2
            Sparklepad BT, LD King of Buzz 2).</small
        >
        </label>
        <label
        >Pack Name
        <input
            class="form-input"
            type="text"
            name="synths[${synthIndex}][presets][0][packName]"
            autocomplete="off"
            data-key="presetPack"
        />
        <ul class="autocomplete-dropdown hidden"></ul>
        <small
            >Provide the name of the preset pack. Leave blank for
            built-in presets.</small
        >
        </label>
        <label
        >Author
        <input
            class="form-input"
            type="text"
            name="synths[${synthIndex}][presets][0][author]"
            autocomplete="off"
            data-key="presetAuthor"
        />
        <ul class="autocomplete-dropdown hidden"></ul>
        <small
            >Identify who created the preset or preset pack. Leave
            blank for manufacturer, for factory presets.</small
        >
        </label>
        <label
        >Usage Type <span class="red">*</span>
        <input
            class="form-input"
            pattern="^([A-Z][a-z]*)(\s[A-Z][a-z]*)*$"
            required
            title="First letter must be capitalized."
            type="text"
            name="synths[${synthIndex}][presets][0][usageType]"
            autocomplete="off"
            data-key="presetUsageType"
        />
        <ul class="autocomplete-dropdown hidden"></ul>
        <small
            >Describe how the preset was used (e.g., Lead, Pad,
            Sequence).</small
        >
        </label>
        <label
        >Preset Audio (Optional)
        <div class="custom-file-input">
            <button type="button" class="browse-button">
            Browse...
            </button>
            <span class="file-name">No file selected.</span>
            <input
            type="file"
            name="synths[${synthIndex}][presets][0][presetAudio]"
            class="audioInput"
            accept="audio/*"
            />
        </div>
        <small>
            Upload a short audio clip (approximately 4 bars)
            demonstrating how the preset is used in the song. The
            clip should feature the melody played
            <strong>without any external effects</strong
            >.<br /><br />

            &bull; If external effects are essential, include 4
            bars of the <strong>wet</strong> version (with
            effects), followed by 4 bars of the
            <strong>dry</strong> version (without effects).<br />
            &bull; If the same preset is used for multiple
            melodies in the song, include all relevant sections in
            the same clip, one after another.<br />
            &bull; If you're unsure how to do this or find these
            instructions unclear, you may leave this field blank.
        </small>
        </label>
    </div>
    </div>

    <button
      type="button"
      class="add-preset-btn"
      data-synth-index="${synthIndex}"
    >
      + Add Another Preset
    </button>

    <hr class="hr--btns" />
  `;

  synthPresetSection.insertBefore(
    newSynth,
    document.querySelector(".add-synth-btn")
  );

  handleInputSelections();
});

/* ------------------------------- Add preset ------------------------------- */
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-preset-btn")) {
    const currSynthIndex = e.target.dataset.synthIndex;
    addPreset(currSynthIndex);
  }
});

const addPreset = function (currSynthIndex) {
  const synthEntry = document.querySelector(
    `.synth-entry[data-synth-index="${currSynthIndex}"]`
  );

  const presetSection = synthEntry.querySelector(".preset-section");
  const presetIndex = presetSection.querySelectorAll(".preset-entry").length;

  const newPreset = document.createElement("div");
  newPreset.classList.add("preset-entry");
  newPreset.innerHTML = `
    <hr class="hr--sep" />
    <div class="preset-entry--new-header">
    <span class="preset-entry--new-text"
        >Additional Preset</span
    >
    <div class="preset-entry-delete--btn">
        <i
        class="fa-solid fa-xmark preset-entry-delete--icon"
        ></i>
    </div>
    </div>
    <label
    >Preset Name <span class="red">*</span>
    <input
        class="form-input"
        required
        type="text"
        name="synths[${currSynthIndex}][presets][${presetIndex}][name]"
        autocomplete="off"
        data-key="presetName"
    />
    <ul class="autocomplete-dropdown hidden"></ul>
    <small
        >Enter the full name of the exact preset used (e.g., 2
        Sparklepad BT, LD King of Buzz 2).</small
    >
    </label>
    <label
    >Pack Name
    <input
        class="form-input"
        type="text"
        name="synths[${currSynthIndex}][presets][${presetIndex}][packName]"
        autocomplete="off"
        data-key="presetPack"
    />
    <ul class="autocomplete-dropdown hidden"></ul>
    <small
        >Provide the name of the preset pack. Leave blank for
        built-in presets.</small
    >
    </label>
    <label
    >Author
    <input
        class="form-input"
        type="text"
        name="synths[${currSynthIndex}][presets][${presetIndex}][author]"
        autocomplete="off"
        data-key="presetAuthor"
    />
    <ul class="autocomplete-dropdown hidden"></ul>
    <small
        >Identify who created the preset or preset pack. Leave
        blank for manufacturer, for factory presets.</small
    >
    </label>
    <label
    >Usage Type <span class="red">*</span>
    <input
        class="form-input"
        pattern="^([A-Z][a-z]*)(\s[A-Z][a-z]*)*$"
        required
        title="First letter must be capitalized."
        type="text"
        name="synths[${currSynthIndex}][presets][${presetIndex}][usageType]"
        autocomplete="off"
        data-key="presetUsageType"
    />
    <ul class="autocomplete-dropdown hidden"></ul>
    <small
        >Describe how the preset was used (e.g., Lead, Pad,
        Sequence).</small
    >
    </label>
    <label
    >Preset Audio (Optional)
    <div class="custom-file-input">
        <button type="button" class="browse-button">
        Browse...
        </button>
        <span class="file-name">No file selected.</span>
        <input
        type="file"
        name="synths[${currSynthIndex}][presets][${presetIndex}][presetAudio]"
        class="audioInput"
        accept="audio/*"
        />
    </div>
    <small>
        Upload a short audio clip (approximately 4 bars)
        demonstrating how the preset is used in the song. The
        clip should feature the melody played
        <strong>without any external effects</strong
        >.<br /><br />

        &bull; If external effects are essential, include 4
        bars of the <strong>wet</strong> version (with
        effects), followed by 4 bars of the
        <strong>dry</strong> version (without effects).<br />
        &bull; If the same preset is used for multiple
        melodies in the song, include all relevant sections in
        the same clip, one after another.<br />
        &bull; If you're unsure how to do this or find these
        instructions unclear, you may leave this field blank.
    </small>
    </label>
  `;

  presetSection.appendChild(newPreset);

  handleInputSelections();
};

/* --------------------------- Delete new entries --------------------------- */
document.addEventListener("click", function (e) {
  const artistDel = e.target.closest(".artist-entry-delete--btn");
  if (artistDel) artistDel.closest(".artist-entry").remove();

  const synthDel = e.target.closest(".synth-entry-delete--btn");
  if (synthDel) synthDel.closest(".synth-entry").remove();

  const presetDel = e.target.closest(".preset-entry-delete--btn");
  if (presetDel) presetDel.closest(".preset-entry").remove();
});

/* ------------------------------ Image inputs ------------------------------ */
const handleImgInputs = function () {
  const imgInputs = document.querySelectorAll(".imageInput");

  imgInputs.forEach((imgInput) => {
    imgInput.addEventListener("change", function () {
      const fileNameDisplay = imgInput
        .closest(".custom-file-input")
        .querySelector(".file-name");

      const file = this.files[0];
      if (!file) return;

      fileNameDisplay.textContent = file.name;

      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = function () {
        if (img.width < 1000 || img.height < 1000) {
          alert("Image must be at least 1000x1000 pixels.");
          imgInput.value = "";
          fileNameDisplay.textContent = "No file selected.";
        }
        URL.revokeObjectURL(img.src);
      };

      img.onerror = function () {
        alert("Invalid image file.");
        imgInput.value = "";
        fileNameDisplay.textContent = "No file selected.";
      };
    });
  });
};

/* --------------------------- Preset audio inputs -------------------------- */
const handleAudioInputs = function () {
  const audioInputs = document.querySelectorAll(".audioInput");

  audioInputs.forEach((audioInput) => {
    audioInput.addEventListener("change", function () {
      const fileNameDisplay = audioInput
        .closest(".custom-file-input")
        .querySelector(".file-name");

      const file = this.files[0];
      if (!file) return;

      fileNameDisplay.textContent = file.name;

      const audio = new Audio();
      audio.src = URL.createObjectURL(file);

      audio.onloadedmetadata = function () {
        if (audio.duration > 120) {
          alert("Audio file must be 2 minutes or less.");
          audioInput.value = "";
          fileNameDisplay.textContent = "No file selected.";
          URL.revokeObjectURL(audio.src);
        }
      };

      audio.onerror = function () {
        alert("Invalid audio file.");
        audioInput.value = "";
        fileNameDisplay.textContent = "No file selected.";
      };
    });
  });
};

/* ----------------------------- Autofill fields ---------------------------- */
const handleAutofillInputs = function () {
  const inputs = document.querySelectorAll("input");

  const data = window.__SEARCH_DATA__;
  const dataset = {
    songTitle: data.songTitles.map((s) => ({ label: s.song_title })),
    albumTitle: data.albumTitles.map((a) => ({ label: a.album_title })),
    genre: data.genres.map((g) => ({ label: g.genre })),
    artistName: data.artistNames.map((a) => ({ label: a.artist_name })),
    artistCountry: data.artistCountrys.map((a) => ({
      label: a.artist_country,
    })),
    artistRole: data.artistRoles.map((a) => ({ label: a.artist_role })),
    synthName: data.synthNames.map((s) => ({ label: s.synth_name })),
    synthManufacturer: data.synthManufacturers.map((s) => ({
      label: s.synth_manufacturer,
    })),
    presetName: data.presetNames.map((p) => ({ label: p.preset_name })),
    presetPack: data.presetPacks.map((p) => ({ label: p.preset_pack_name })),
    presetAuthor: data.presetAuthors.map((p) => ({ label: p.preset_author })),
    presetUsageType: data.presetUsageTypes.map((p) => ({
      label: p.preset_usage_type,
    })),
  };

  let debounceTimeout;
  inputs.forEach((input) => {
    if (!dataset[input.dataset.key]) {
      return;
    }

    const dropdown = input.parentElement.querySelector(
      ".autocomplete-dropdown"
    );

    let selectedIndex = -1;
    handleKeyboardNavigation(
      input,
      dropdown,
      () => selectedIndex,
      (val) => {
        selectedIndex = val;
      }
    );

    input.addEventListener("input", () => {
      input.addEventListener("blur", () => {
        setTimeout(() => {
          hideDropdown(dropdown);
        }, 100);
      });

      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        const query = input.value.trim();
        if (query.length === 0) {
          hideDropdown(dropdown);
          return;
        }

        const fuse = new Fuse(dataset[input.dataset.key], {
          keys: ["label"],
          includeScore: true,
          threshold: 0.3,
          distance: 100,
          ignoreLocation: true,
        });

        renderDropdown(
          dropdown,
          fuse
            .search(query)
            .slice(0, 5)
            .map((r) => r.item)
        );
        selectedIndex = -1;
      }, 150);
    });
  });

  const renderDropdown = function (dropdown, items) {
    dropdown.innerHTML = "";

    if (items.length === 0) {
      hideDropdown(dropdown);
      return;
    }

    items.forEach((item, index) => {
      const listItem = item.label;

      const li = document.createElement("li");
      li.textContent = listItem;
      li.setAttribute("data-index", index);

      li.addEventListener("click", (e) => {
        e.preventDefault();
        const input = dropdown.parentElement.querySelector(".form-input");
        input.value = listItem;
        hideDropdown(dropdown);
      });

      dropdown.appendChild(li);
    });

    dropdown.classList.add("show");
    dropdown.classList.remove("hidden");
  };

  const hideDropdown = function (dropdown) {
    dropdown.classList.remove("show");
    dropdown.classList.add("hidden");
  };

  function handleKeyboardNavigation(
    input,
    dropdown,
    getSelectedIndex,
    setSelectedIndex
  ) {
    input.addEventListener("keydown", (e) => {
      const items = dropdown.querySelectorAll("li");

      if (items.length === 0) return;

      let currentIndex = getSelectedIndex();

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          currentIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          updateSelection(items, currentIndex);
          setSelectedIndex(currentIndex);
          break;

        case "ArrowUp":
          e.preventDefault();
          currentIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          updateSelection(items, currentIndex);
          setSelectedIndex(currentIndex);
          break;

        case "Enter":
          e.preventDefault();
          if (currentIndex >= 0 && items[currentIndex]) {
            input.value = items[currentIndex].textContent;
            hideDropdown(dropdown);
            setSelectedIndex(-1);
          }
          break;

        case "Escape":
          hideDropdown(dropdown);
          setSelectedIndex(-1);
          break;
      }
    });
  }

  function updateSelection(items, newIndex) {
    items.forEach((item) => item.classList.remove("selected"));

    if (newIndex >= 0 && items[newIndex]) {
      items[newIndex].classList.add("selected");

      items[newIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }
};

/* ----------------------------- Form validation ---------------------------- */
const validateForm = function () {
  const form = document.getElementById("entryForm");
  const songImg = document.querySelector('input[name="songImg"]');
  const albumImg = document.querySelector('input[name="albumImg"]');

  form.addEventListener("submit", (e) => {
    const songImgUploaded = songImg.files.length > 0;
    const albumImgUploaded = albumImg.files.length > 0;

    const failSubmit = (msg) => {
      e.preventDefault();
      alert(msg);
    };

    if (!singleCheckBox.checked) {
      if (!albumImgUploaded && !songImgUploaded) {
        return failSubmit("You must upload at least the album image.");
      }
      if (songImgUploaded && !albumImgUploaded) {
        return failSubmit(
          "You must upload the album image if you upload the song image."
        );
      }
    }

    const roleInputs = form.querySelectorAll(
      'input[name^="artists"][name$="[role]"]'
    );
    const hasMainRole = Array.from(roleInputs).some(
      (input) => input.value.trim() === "Main"
    );

    if (!hasMainRole) {
      return failSubmit("At least one artist must have the role 'Main'.");
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  handleInputSelections();
  validateForm();
});
