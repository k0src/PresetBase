/* ---------------------------- Add artist, preset button --------------------------- */

const artistIndex = document.querySelectorAll(".artist-entry").length;
const presetIndex = document.querySelectorAll(".preset-entry").length;

document.querySelector(".add-artist-btn").addEventListener("click", () => {
  const artistSection = document.getElementById("artistSection");
  const newArtist = document.createElement("div");
  newArtist.classList.add("artist-entry");
  newArtist.innerHTML = `
    <label>Artist Name <span class="red">*</span>
      <input required type="text" name="artists${artistIndex}[name]" />
      <small>Name of the artist.</small>
    </label>
    <label>Artist Country <span class="red">*</span>
      <input required type="text" name="artists${artistIndex}[country]" />
      <small>Country of origin.</small>
    </label>
    <label
      >Artist role <span class="red">*</span>
      <input required type="text" name="artists${artistIndex}[role]" />
      <small
        >Enter the artist's role on the song. If the artist is the
        main artist, use 'Main'. Specify only one role.</small
      >
    </label>
    <label>Artist Image <span class="red">*</span>
      <input required type="url" name="artists${artistIndex}[image_url]" />
        <small>
        Enter the direct URL to the artist photo (1000px x 1000px
        miniumum). If using an image hosting service such as Imgur,
        use the direct image link (e.g.,
        https://i.imgur.com/LbekjA3.jpeg).
      </small>
    </label>
  `;
  artistSection.insertBefore(
    newArtist,
    document.querySelector(".add-artist-btn")
  );
});

document.querySelector(".add-preset-btn").addEventListener("click", () => {
  const presetSection = document.getElementById("presetSection");
  const newPreset = document.createElement("div");
  newPreset.classList.add("preset-entry");
  newPreset.innerHTML = `
    <label>Preset Name <span class="red">*</span>
        <input required type="text" name="presets${presetIndex}[name]" />
        <small>Full name of the exact preset used (e.g., 2 Sparklepad BT, LD King of Buzz 2).</small>
    </label>
    <label>Pack Name <span class="red">*</span>
        <input required type="text" name="presets${presetIndex}[pack_name]" />
        <small>Name of the preset pack (use 'Factory' for factory presets).</small>
    </label>
    <label>Author <span class="red">*</span>
        <input required type="text" name="presets${presetIndex}[author]" />
        <small>Who made the preset or pack (use manufacturer for factory presets).</small>
    </label>
    <label>Usage Type <span class="red">*</span>
        <input required type="text" name="presets${presetIndex}[usage_type]" />
        <small>What was the preset used for (e.g., lead, pad, sequence).</small>
    </label>
    <label>Video Link (Optional)
        <input type="url" name="presets${presetIndex}[video_link]" />
        <small>Demo video link (optional).</small>
    </label>
`;
  presetSection.insertBefore(
    newPreset,
    document.querySelector(".add-preset-btn")
  );
});

/* ----------------------------- Single checkbox ---------------------------- */

const singleCheckBox = document.getElementById("singleCheckBox");
const artistFields = document.querySelectorAll(".artist-field");

singleCheckBox.addEventListener("change", () => {
  const isChecked = singleCheckBox.checked;

  const hiddenInput = document.querySelector('input[name="singleHidden"]');
  hiddenInput.value = isChecked ? "yes" : "no";

  artistFields.forEach((field) => {
    if (isChecked) {
      field.removeAttribute("required");
      field.setAttribute("disabled", "true");
    } else {
      field.setAttribute("required", "true");
      field.removeAttribute("disabled");
    }
  });
});

/* --------------------------- Close alert button --------------------------- */

const alertCloseBtn = document.querySelector(".alert-close-btn");
const alertWindow = document.querySelector(".alert-window");

alertCloseBtn.addEventListener("click", () => {
  alertWindow.classList.remove("window-open");
  alertWindow.addEventListener("transitionend", () => {
    alertWindow.classList.add("hide");
    alertWindow.removeEventListener("transitionend", hideAfterTransition);
  });
});
