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

/* ------------------------ Add artist, preset button ----------------------- */
document.querySelector(".add-artist-btn").addEventListener("click", () => {
  const artistSection = document.getElementById("artistSection");

  const artistIndex = artistSection.querySelectorAll(
    ".artist-entry, .artist-entry--new"
  ).length;

  const newArtist = document.createElement("div");
  newArtist.classList.add("artist-entry--new");
  newArtist.innerHTML = `
    <label
        >Artist Name <span class="red">*</span>
        <input
            class="form-input"
            required
            type="text"
            name="artists[${artistIndex}][name]"
        />
        <small>Name of the artist.</small>
        </label>
        <label
        >Artist Country <span class="red">*</span>
        <input
            class="form-input"
            required
            type="text"
            name="artists[${artistIndex}][country]"
        />
        <small>Country of origin.</small>
        </label>
        <label
        >Artist role <span class="red">*</span>
        <input
            class="form-input"
            required
            type="text"
            name="artists[${artistIndex}][role]"
        />
        <small
            >Enter the artist's role on the song. If the artist is the
            main artist, use 'Main'. Specify only one role.</small
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

        <small>
            Upload the song cover image. Leave blank to use album
            cover. (1000px x 1000px minimum).
        </small>
    </label>
    `;

  artistSection.insertBefore(
    newArtist,
    document.querySelector(".add-artist-btn")
  );

  handleImgInputs();
});

document.querySelector(".add-preset-btn").addEventListener("click", () => {
  const presetSection = document.getElementById("presetSection");

  const presetIndex = document.querySelectorAll(
    ".preset-entry, .preset-entry--new"
  ).length;

  const newPreset = document.createElement("div");
  newPreset.classList.add("preset-entry--new");
  newPreset.innerHTML = `
    <label
        >Preset Name <span class="red">*</span>
        <input
            class="form-input"
            required
            type="text"
            name="presets[${presetIndex}][name]"
        />
        <small
            >Full name of the exact preset used (e.g., 2 Sparklepad
            BT, LD King of Buzz 2).</small
        >
        </label>
        <label
        >Pack Name <span class="red">*</span>
        <input
            class="form-input"
            required
            type="text"
            name="presets[${presetIndex}][pack_name]"
        />
        <small
            >Name of the preset pack (use 'Factory' for factory
            presets).</small
        >
        </label>
        <label
        >Author <span class="red">*</span>
        <input
            class="form-input"
            required
            type="text"
            name="presets[${presetIndex}][author]"
        />
        <small
            >Who made the preset or pack (use manufacturer for factory
            presets).</small
        >
        </label>
        <label
        >Usage Type <span class="red">*</span>
        <input
            class="form-input"
            pattern="^[A-Z][a-z]*( [A-Z][a-z]*)*$"
            required
            title="First letter must be capitalized."
            type="text"
            name="presets[${presetIndex}][usage_type]"
        />
        <small
            >What was the preset used for (e.g., lead, pad,
            sequence).</small
        >
        </label>
        <label
        >Video Link (Optional)
        <input
            class="form-input"
            type="url"
            name="presets[${presetIndex}][video_link]"
        />
        <small>Demo video link (optional).</small>
    </label>
    `;

  presetSection.insertBefore(
    newPreset,
    document.querySelector(".add-preset-btn")
  );
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

document.addEventListener("DOMContentLoaded", () => {
  handleImgInputs();
});
