const sortDropdownBtn = document.querySelector(".result-sort-btn");
const sortDropdownItems = document.querySelectorAll(
  ".result-sort-content--item"
);
const filterInput = document.querySelector(".result-filters--input");
const genreTags = document.querySelectorAll(".result-entry--genre");

/* SORTING */

const sortSongs = function (key) {
  window.location.href = `/browse/songs?sort=${encodeURIComponent(key)}`;
};

sortDropdownBtn.addEventListener("click", () => {
  document
    .querySelector(".result-sort-content")
    .classList.toggle("result-sort-content--show");
});

sortDropdownItems.forEach((item) => {
  item.addEventListener("click", () => {
    sortSongs(item.id);
  });
});

/* FILTERING */

const filterResults = function (query) {
  const lowerQuery = query.trim().toLowerCase();

  document.querySelectorAll(".result-entry").forEach((entry) => {
    const song = entry
      .querySelector(".result-entry--song-title")
      .textContent.toLowerCase();
    const artist = entry
      .querySelector(".result-entry--artist-name")
      .textContent.toLowerCase();
    const album = entry
      .querySelector(".result-entry--album-title")
      .textContent.toLowerCase();

    const matches =
      !lowerQuery ||
      song.includes(lowerQuery) ||
      artist.includes(lowerQuery) ||
      album.includes(lowerQuery);

    entry.classList.toggle("hide", !matches);
  });
};

filterInput.addEventListener("input", () => {
  filterResults(filterInput.value);
});

/* APPLYING DYNAMIC GENRE TAG CLASS */

genreTags.forEach((tag) => {
  tag.classList.add(
    `result-entry--genre--${tag.textContent
      .trim()
      .toLowerCase()
      .replaceAll(" ", "-")}`
  );
});
