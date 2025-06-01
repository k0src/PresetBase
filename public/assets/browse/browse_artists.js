const sortDropdownBtn = document.querySelector(".result-sort-btn");
const sortDropdownItems = document.querySelectorAll(
  ".result-sort-content--item"
);
const sortDropdownContent = document.querySelector(".result-sort-content");
const filterInput = document.querySelector(".result-filter--input");
const filterClearBtn = document.querySelector(".result-filter--clear");
const viewModeBtns = document.querySelectorAll(".results-view-btn");

/* SORTING */
const sortArtists = function (key) {
  window.location.href = `/browse/artists?sort=${encodeURIComponent(key)}`;
};

sortDropdownBtn.addEventListener("click", () => {
  sortDropdownContent.classList.toggle("result-sort-content--show");
});

sortDropdownItems.forEach((item) => {
  item.addEventListener("click", () => {
    sortArtists(item.id);
  });
});

/* FILTERING */
const filterList = function (query) {
  const lowerQuery = query.trim().toLowerCase();

  document.querySelectorAll(".result-entry").forEach((entry) => {
    const name = entry
      .querySelector(".result-entry--artist-name")
      .textContent.toLowerCase();

    const matches = !lowerQuery || name.includes(lowerQuery);

    entry.classList.toggle("hide", !matches);
  });
};

const filterCards = function (query) {
  const lowerQuery = query.trim().toLowerCase();

  document.querySelectorAll(".card-entry").forEach((entry) => {
    const name = entry
      .querySelector(".card-entry--artist-name")
      .textContent.toLowerCase();

    const matches = !lowerQuery || name.includes(lowerQuery);

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
    const isList = btn.id === "list-btn";
    localStorage.setItem("userViewMode", isList ? "list" : "grid");

    isList
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

/* SET VIEW MODE ON PAGE LOAD */
document.addEventListener("DOMContentLoaded", () => {
  const savedView = localStorage.getItem("userViewMode");

  if (savedView === "grid") {
    toggleViewMode(
      "grid-btn",
      "list-btn",
      ".grid-view-container",
      ".list-view-container"
    );
  } else {
    toggleViewMode(
      "list-btn",
      "grid-btn",
      ".list-view-container",
      ".grid-view-container"
    );
  }
});
