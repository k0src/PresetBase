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
      if (fileInputField) {
        fileInputField.classList.add("disabled");
      } else {
        field.removeAttribute("required");
        field.setAttribute("disabled", "true");
      }
    } else {
      if (fileInputField) {
        fileInputField.classList.remove("disabled");
      } else {
        field.setAttribute("required", "true");
        field.removeAttribute("disabled");
      }
    }
  });
});

/* ------------------------------- Add Artist ------------------------------- */
document.querySelector(".add-artist-btn").addEventListener("click", () => {
  const artistSection = document.getElementById("artistSection");

  const artistIndex = artistSection.querySelectorAll(".artist-entry").length;

  const newArtist = document.createElement("div");
  newArtist.classList.add("artist-entry");
  newArtist.classList.add("form-section");
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
      >
      Artist Name <span class="red">*</span>
      <input
          class="form-input"
          required
          type="text"
          name="artists[${artistIndex}][name]"                      
          autocomplete="off"
          data-key="artistName"
          data-primary="true"
          />
      <ul class="autocomplete-dropdown hidden"></ul>
      <small>Enter the name of the artist.</small>
    </label>
    <label
      >
      Artist Country <span class="red">*</span>
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
      >
      Artist Role <span class="red">*</span>
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
      <div class="img-upload-container">
          <img
            src="/assets/images/image-upload-placeholder.webp"
            alt="Uploaded Image"
            class="img-upload-display"
            />
          <div class="file-input-wrapper">
            <div class="custom-file-input input-margin-bottom">
                <button type="button" class="browse-button">
                Browse...
                </button>
                <span class="file-name">No file selected.</span>
                <input
                  type="file"
                  name="artists[${artistIndex}][img]"
                  class="imageInput"
                  accept="image/*"
                  data-key="artistImg"
                  />
            </div>
            <small
                >Upload the artist's image. Minimum dimensions: 1000 x 1000
            pixels.</small
                >
          </div>
      </div>
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
  <div class="form-section">
    <label
        >
        Synth Name <span class="red">*</span>
        <input
          class="form-input"
          required
          type="text"
          name="synths[${synthIndex}][name]"                      
          autocomplete="off"
          data-key="synthName"
          data-primary="true"
          />
        <ul class="autocomplete-dropdown hidden"></ul>
        <small>Name the synth used in the track.</small>
    </label>
    <label
        >
        Manufacturer <span class="red">*</span>
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
        data-key="synthYear"
        name="synths[${synthIndex}][year]"
        />
    <small>Enter the synth's release year.</small>
    </label>
    <label
        >
        Type <span class="red">*</span>
        <select required data-key="synthType" name="synths[${synthIndex}][type]">
          <option value="VST">VST</option>
          <option value="Hardware">Hardware</option>
          <option value="Kontakt Bank">Kontakt Bank</option>
          <option value="SoundFont">SoundFont</option>
        </select>
        <small>Select the synth format.</small>
    </label>
    <label>
        Synth Image <span class="red">*</span>
        <div class="img-upload-container">
          <img
              src="/assets/images/image-upload-placeholder.webp"
              alt="Uploaded Image"
              class="img-upload-display"
              />
          <div class="file-input-wrapper">
              <div class="custom-file-input input-margin-bottom">
                <button type="button" class="browse-button">
                Browse...
                </button>
                <span class="file-name">No file selected.</span>
                <input
                    type="file"
                    name="synths[${synthIndex}][img]"
                    class="imageInput"
                    accept="image/*"
                    data-key="synthImg"
                    />
              </div>
              <small
                >Upload an image of the synth. Minimum dimensions: 1000 x
              1000 pixels.</small
                >
          </div>
        </div>
    </label>
  </div>

  <div class="preset-section">
    <div class="preset-entry form-section">
        <label
          >
          Preset Name <span class="red">*</span>
          <input
              class="form-input"
              required
              type="text"
              name="synths[${synthIndex}][presets][0][name]"                          
              autocomplete="off"
              data-key="presetName"
              data-primary="true"
              />
          <ul class="autocomplete-dropdown hidden"></ul>
          <small
              >Enter the full name of the exact preset used (e.g., 2
          Sparklepad BT, LD King of Buzz 2).</small
              >
        </label>
        <label
          >
          Pack Name
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
          >
          Author
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
          >
          Usage Type <span class="red">*</span>
          <input
              class="form-input"
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
          >
          Preset Audio (Optional)
          <div class="audio-upload-container input-margin-bottom">
              <div class="audio-upload-btn-container">
                <i
                    class="fa-solid fa-circle-play audio-upload--play-btn"
                    ></i>
                <i
                    class="fa-solid fa-circle-stop audio-upload--play-btn-active hidden"
                    ></i>
              </div>
              <audio class="uploaded-audio" src=""></audio>
              <div class="custom-file-input">
                <button type="button" class="browse-button">
                Browse...
                </button>
                <span class="file-name">No file selected.</span>
                <input
                    type="file"
                    name="synths[${synthIndex}][presets][0][audio]"
                    class="audioInput"
                    accept="audio/*"
                    />
              </div>
          </div>
          <small>
          Upload a short <kbd>.mp3</kbd> audio clip (approximately 4 bars)
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
  newPreset.classList.add("form-section");
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
      >
      Preset Name <span class="red">*</span>
      <input
          class="form-input"
          required
          type="text"
          name="synths[${currSynthIndex}][presets][${presetIndex}][name]"
          autocomplete="off"
          data-key="presetName"
          data-primary="true"
          />
      <ul class="autocomplete-dropdown hidden"></ul>
      <small
          >Enter the full name of the exact preset used (e.g., 2
      Sparklepad BT, LD King of Buzz 2).</small
          >
    </label>
    <label
      >
      Pack Name
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
      >
      Author
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
      >
      Usage Type <span class="red">*</span>
      <input
          class="form-input"
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
      >
      Preset Audio (Optional)
      <div class="audio-upload-container input-margin-bottom">
          <div class="audio-upload-btn-container">
            <i
                class="fa-solid fa-circle-play audio-upload--play-btn"
                ></i>
            <i
                class="fa-solid fa-circle-stop audio-upload--play-btn-active hidden"
                ></i>
          </div>
          <audio class="uploaded-audio" src=""></audio>
          <div class="custom-file-input">
            <button type="button" class="browse-button">
            Browse...
            </button>
            <span class="file-name">No file selected.</span>
            <input
                type="file"
                name="synths[${currSynthIndex}][presets][${presetIndex}][audio]"
                class="audioInput"
                accept="audio/*"
                />
          </div>
      </div>
      <small>
      Upload a short <kbd>.mp3</kbd> audio clip (approximately 4 bars)
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
      const file = this.files[0];
      if (!file) return;

      // Validate image
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onerror = function () {
        alert("Invalid image file.");
      };

      img.onload = function () {
        if (img.width < 1000 || img.height < 1000) {
          alert("Image must be at least 1000x1000 pixels.");
        } else {
          // Change filename
          const fileNameDisplay = imgInput
            .closest(".custom-file-input")
            .querySelector(".file-name");

          fileNameDisplay.textContent = file.name;

          // Display image
          const imgDisplay = imgInput
            .closest(".img-upload-container")
            .querySelector(".img-upload-display");

          imgDisplay.src = img.src;
        }

        URL.revokeObjectURL(img.src);
      };
    });
  });
};

/* --------------------------- Preset audio inputs -------------------------- */
const handleAudioPlayback = function (playBtns) {
  const playBtn = playBtns.querySelector(".audio-upload--play-btn");
  const stopBtn = playBtns.querySelector(".audio-upload--play-btn-active");

  playBtn.addEventListener("click", () => {
    document.querySelectorAll(".uploaded-audio").forEach((otherAudio) => {
      if (!otherAudio.paused) {
        otherAudio.pause();
        otherAudio.currentTime = 0;

        const otherContainer = otherAudio
          .closest(".audio-upload-container")
          .querySelector(".audio-upload-btn-container");
        otherContainer
          .querySelector(".audio-upload--play-btn")
          .classList.remove("hidden");
        otherContainer
          .querySelector(".audio-upload--play-btn-active")
          .classList.add("hidden");
      }
    });

    const audio = playBtns
      .closest(".audio-upload-container")
      .querySelector(".uploaded-audio");

    if (audio.paused) {
      audio.play();

      playBtn.classList.add("hidden");
      stopBtn.classList.remove("hidden");
    } else {
      audio.pause();
      audio.currentTime = 0;

      playBtn.classList.remove("hidden");
      stopBtn.classList.add("hidden");
    }

    audio.addEventListener("ended", () => {
      playBtn.classList.remove("hidden");
      stopBtn.classList.add("hidden");
    });
  });

  stopBtn.addEventListener("click", () => {
    const audio = playBtns
      .closest(".audio-upload-container")
      .querySelector(".uploaded-audio");

    audio.pause();
    audio.currentTime = 0;

    playBtn.classList.remove("hidden");
    stopBtn.classList.add("hidden");
  });
};

const setupAudio = function (input, audioSrc, fileName = null) {
  const container = input.closest(".audio-upload-container");
  const audioDisplay = container.querySelector(".uploaded-audio");
  const playBtns = container.querySelector(".audio-upload-btn-container");
  const fileNameDisplay = input
    .closest(".custom-file-input")
    ?.querySelector(".file-name");

  if (fileName && fileNameDisplay) {
    fileNameDisplay.textContent = fileName;
  }

  audioDisplay.src = audioSrc;
  handleAudioPlayback(playBtns);
};

const handleAudioInputs = function () {
  const audioInputs = document.querySelectorAll(".audioInput");

  audioInputs.forEach((audioInput) => {
    audioInput.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;

      // Validate Audio
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);

      audio.onerror = function () {
        alert("Invalid audio file.");
      };

      audio.onloadedmetadata = function () {
        if (audio.duration > 120) {
          alert("Audio file must be 2 minutes or less.");
        } else {
          setupAudio(audioInput, audio.src, file.name);
        }
      };
    });
  });
};

/* ----------------------------- Autofill fields ---------------------------- */
/* -------------------------------- API Calls ------------------------------- */
const fetchAutofillResults = async function (type, query, limit) {
  const url = `/api/autofill/${encodeURIComponent(
    type
  )}?query=${encodeURIComponent(query)}&limit=${limit}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Autofill fetch failed");

  const data = await res.json();
  return data.map((row) => Object.values(row)[0]);
};

const fetchFillInfo = async function (type, query) {
  const url = `/api/loadcomplete/${encodeURIComponent(
    type
  )}?query=${encodeURIComponent(query)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Fill info fetch failed");

  return await res.json();
};

/* ----------------------- Attempt to autofill section ---------------------- */
let autofilled = false;

const attemptToAutofill = async function (section, inputType) {
  const primaryInput = section.querySelector("input[data-primary='true']");
  if (!primaryInput) return;

  try {
    const results = await fetchFillInfo(inputType, primaryInput.value);
    if (results.length !== 1) return;

    const result = results[0];

    // Fill text inputs
    const textInputs = section.querySelectorAll("input:not([type='file'])");
    textInputs.forEach((input) => {
      const key = input.dataset.key;
      if (key && result[key] !== undefined) input.value = result[key];
    });

    // Fill select inputs
    const selects = section.querySelectorAll("select");
    selects.forEach((select) => {
      const key = select.dataset.key;
      const val = result[key];
      if (key && val !== undefined) {
        for (const option of select.options) {
          if (option.value === val) {
            select.value = val;
            break;
          }
        }
      }
    });

    // Fill image fields
    const fileInputs = section.querySelectorAll("input[type='file']");
    fileInputs.forEach((fileInput) => {
      const key = fileInput.dataset.key;
      const val = result[key];
      if (val) {
        const imgContainer = fileInput.closest(".img-upload-container");
        if (imgContainer) {
          const img = imgContainer.querySelector("img.img-upload-display");
          const label = imgContainer.querySelector(".file-name");
          if (img) img.src = val;
          if (label) label.textContent = `${result[inputType]}`;
        }
      }
    });

    autofilled = true;
  } catch (err) {
    console.error("Error fetching autofill section results: ", err);
  }
};

/* -------------------------- Main autiofill logic -------------------------- */
const handleAutofillInputs = function () {
  const inputs = document.querySelectorAll("input");

  inputs.forEach((input) => {
    const inputType = input.dataset.key;
    const isPrimary = input.dataset.primary === "true";
    const section = input.closest(".form-section");

    if (!inputType || input.type === "file") return;

    const dropdown = input.parentElement.querySelector(
      ".autocomplete-dropdown"
    );

    if (!dropdown) return;

    let selectedIndex = -1;
    let debounceTimeout;

    input.addEventListener("input", () => {
      clearTimeout(debounceTimeout);

      input.addEventListener("blur", () => {
        setTimeout(() => hideDropdown(dropdown), 100);
      });

      debounceTimeout = setTimeout(async () => {
        const query = input.value.trim();
        if (query.length === 0) return hideDropdown(dropdown);

        try {
          const results = await fetchAutofillResults(inputType, query, 5);
          renderDropdown(dropdown, results, section, isPrimary, inputType);
        } catch (err) {
          console.error("Error fetching autofill results: ", err);
        }

        selectedIndex = -1;
      }, 150);
    });

    input.addEventListener("keydown", (e) => {
      const items = dropdown.querySelectorAll("li");
      if (!items.length) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          selectedIndex = (selectedIndex + 1) % items.length;
          updateSelection(items, selectedIndex);
          break;
        case "ArrowUp":
          e.preventDefault();
          selectedIndex = (selectedIndex - 1 + items.length) % items.length;
          updateSelection(items, selectedIndex);
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && items[selectedIndex]) {
            input.value = items[selectedIndex].textContent;
            hideDropdown(dropdown);
            if (isPrimary) attemptToAutofill(section, inputType);
          }
          break;
        case "Escape":
          hideDropdown(dropdown);
          selectedIndex = -1;
          break;
      }
    });
  });
};

function renderDropdown(dropdown, items, section, isPrimary, inputType) {
  dropdown.innerHTML = "";
  if (!items.length) return hideDropdown(dropdown);

  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = item;
    li.dataset.index = index;

    li.addEventListener("click", (e) => {
      e.preventDefault();
      const input = dropdown.parentElement.querySelector(".form-input");
      input.value = item;
      hideDropdown(dropdown);
      if (isPrimary) attemptToAutofill(section, inputType);
    });

    dropdown.appendChild(li);
  });

  dropdown.classList.remove("hidden");
  dropdown.classList.add("show");
}

function hideDropdown(dropdown) {
  dropdown.classList.remove("show");
  dropdown.classList.add("hidden");
}

function updateSelection(items, index) {
  items.forEach((el) => el.classList.remove("selected"));
  if (index >= 0 && items[index]) {
    items[index].classList.add("selected");
    items[index].scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

/* ----------------------------- Form validation ---------------------------- */
const validateForm = function () {
  const form = document.getElementById("entryForm");
  const albumImg = document.querySelector('input[name="albumImg"]');
  const synthImg = document.querySelector('input[name="synthImg"]');
  const songImg = document.querySelector('input[name="songImg"]');
  const singleCheckBox = document.getElementById("singleCheckBox");

  form.addEventListener("submit", (e) => {
    const failSubmit = (msg) => {
      e.preventDefault();
      alert(msg);
    };

    if (!autofilled) {
      const albumImgUploaded = albumImg.files.length > 0;
      const synthImgUploaded = synthImg.files.length > 0;

      if (!synthImgUploaded) {
        return failSubmit("You must upload an image for the synth.");
      }

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
