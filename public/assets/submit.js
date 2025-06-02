/* ---------------------------- Add artist, preset button --------------------------- */

document.querySelector(".add-artist-btn").addEventListener("click", () => {
  const artistSection = document.getElementById("artistSection");
  const newArtist = document.createElement("div");
  newArtist.classList.add("artist-entry");
  newArtist.innerHTML = `
    <label>Artist Name <span class="red">*</span>
      <input required type="text" name="artistName[]" />
      <small>Name of the artist.</small>
    </label>
    <label>Country <span class="red">*</span>
      <input required type="text" name="artistCountry[]" />
      <small>Country of origin.</small>
    </label>
    <label>Artist Image <span class="red">*</span>
      <input required type="url" name="artistImg[]" />
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
        <input required type="text" name="presetName[]" />
        <small>Full name of the exact preset used (e.g., 2 Sparklepad BT, LD King of Buzz 2).</small>
    </label>
    <label>Pack Name <span class="red">*</span>
        <input required type="text" name="packName[]" />
        <small>Name of the preset pack (use 'Factory' for factory presets).</small>
    </label>
    <label>Author <span class="red">*</span>
        <input required type="text" name="presetAuthor[]" />
        <small>Who made the preset or pack (use manufacturer for factory presets).</small>
    </label>
    <label>Usage Type <span class="red">*</span>
        <input required type="text" name="usageType[]" />
        <small>What was the preset used for (e.g., lead, pad, sequence).</small>
    </label>
    <label>Video Link (Optional)
        <input type="url" name="videoLink[]" />
        <small>Demo video link (optional).</small>
    </label>
`;
  presetSection.insertBefore(
    newPreset,
    document.querySelector(".add-preset-btn")
  );
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
