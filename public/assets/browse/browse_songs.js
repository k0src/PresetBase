const sortDropdownBtn = document.querySelector(".result-sort-btn");
const sortDropdownItems = document.querySelectorAll(
  ".result-sort-content--item"
);
const filterInput = document.querySelector(".result-filter--input");
const genreTags = document.querySelectorAll(".genre-tag");
const filterClearBtn = document.querySelector(".result-filter--clear");
const viewModeBtns = document.querySelectorAll(".results-view-btn");

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
const filterList = function (query) {
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

const filterCards = function (query) {
  const lowerQuery = query.trim().toLowerCase();

  document.querySelectorAll(".card-entry").forEach((entry) => {
    const song = entry
      .querySelector(".card-entry--song-title")
      .textContent.toLowerCase();
    const artist = entry
      .querySelector(".card-entry--artist-name")
      .textContent.toLowerCase();
    const album = entry
      .querySelector(".card-entry--album-title")
      .textContent.toLowerCase();

    const matches =
      !lowerQuery ||
      song.includes(lowerQuery) ||
      artist.includes(lowerQuery) ||
      album.includes(lowerQuery);

    entry.style.display = matches ? "flex" : "none";
  });
};

const filterResults = function (query) {
  filterList(query);
  filterCards(query);
};

filterInput.addEventListener("input", () => {
  filterResults(filterInput.value);
});

/* CLEAR FILTER INPUT */
filterClearBtn.addEventListener("click", () => {
  filterInput.value = "";
  filterResults(filterInput.value);
});

/* APPLYING DYNAMIC GENRE TAG CLASS */
genreTags.forEach((tag) => {
  tag.classList.add(
    `tag-genre--${tag.textContent.trim().toLowerCase().replaceAll(" ", "-")}`
  );
});

/* CHANGE VIEW MODE */
const toggleViewMode = function (
  activeBtnID,
  inactiveBtnID,
  showContainerClass,
  hideContainerClass
) {
  document
    .getElementById(activeBtnID)
    .classList.add("results-view-btn--active");
  document
    .getElementById(inactiveBtnID)
    .classList.remove("results-view-btn--active");

  document.querySelector(hideContainerClass).classList.add("hide");
  document.querySelector(showContainerClass).classList.remove("hide");
};

viewModeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.id === "list-btn"
      ? toggleViewMode(
          "list-btn",
          "grid-btn",
          ".list-view-container",
          ".grid-view-container"
        )
      : toggleViewMode(
          "grid-btn",
          "list-btn",
          ".grid-view-container",
          ".list-view-container"
        );
  });
});
