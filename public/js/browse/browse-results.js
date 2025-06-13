const currentPage = window.location.pathname.split("/")[2];

/* ----------------------------- Skeleton Loader ---------------------------- */
window.addEventListener("load", () => {
  document.getElementById("skeleton-loader").style.display = "none";
  document.querySelector(".search-results-list--container").style.display =
    "block";
  document.querySelector(".search-results-grid--container").style.display =
    "block";
});

/* --------------------------------- Sorting -------------------------------- */
const sortSelect = document.querySelector(".browse-results--sort-select");

sortSelect.addEventListener("change", () => {
  localStorage.setItem("synthSortSelected", sortSelect.value);

  window.location.href = `/browse/${currentPage}?sort=${encodeURIComponent(
    sortSelect.value
  )}`;
});

/* ---------------------------- View mode toggle ---------------------------- */
const viewModeToggle = document.getElementById("view-toggle");

const setToggleViewMode = function (mode) {
  const grid = document.querySelector(".search-results-grid--container");
  const list = document.querySelector(".search-results-list--container");
  if (mode === "grid") {
    grid.classList.remove("hide");
    list.classList.add("hide");
    viewModeToggle.setAttribute("data-mode", "grid");
  } else {
    grid.classList.add("hide");
    list.classList.remove("hide");
    viewModeToggle.setAttribute("data-mode", "list");
  }
};

viewModeToggle.addEventListener("click", () => {
  const currentMode = viewModeToggle.getAttribute("data-mode");
  const mode = currentMode === "list" ? "grid" : "list";
  setToggleViewMode(mode);
  localStorage.setItem(`user${currentPage}ViewMode`, mode);
});

/* ------------------------- Setting values on load ------------------------- */
const setSortSelectValue = function () {
  const sortValue = localStorage.getItem("synthSortSelected");
  if (sortValue) {
    sortSelect.value = sortValue;
  }
};

const setUserView = function () {
  const userView = localStorage.getItem(`user${currentPage}ViewMode`) || "list";
  setToggleViewMode(userView);
};

document.addEventListener("DOMContentLoaded", () => {
  setSortSelectValue();
  setUserView();
});

/* ---------------------------- Filtering results --------------------------- */
const pageFieldConfig = {
  albums: ["primary", "secondary"],
  artists: ["primary"],
  genres: ["primary"],
  presets: ["primary", "secondary", "tertiary"],
  songs: ["primary", "secondary", "tertiary"],
  synths: ["primary", "secondary"],
};

const filterInput = document.querySelector(".browse-results-filter--input");
const filterClearBtn = document.querySelector(".result-filter--clear");

const filterEntries = function (query, entrySelector, prefix) {
  const lowerQuery = query.trim().toLowerCase();
  const fields = pageFieldConfig[currentPage];

  document.querySelectorAll(entrySelector).forEach((entry) => {
    const matchFound = fields.some((field) => {
      const el = entry.querySelector(`.${prefix}--${field}`);
      return el && el.textContent.toLowerCase().includes(lowerQuery);
    });

    if (entrySelector === ".card-entry") {
      entry.style.display = !lowerQuery || matchFound ? "flex" : "none";
    } else {
      entry.classList.toggle("hide", lowerQuery && !matchFound);
    }
  });
};

const filterResults = function (query) {
  filterEntries(query, ".result-entry", "result-entry");
  filterEntries(query, ".card-entry", "card-entry");
};

filterInput.addEventListener("input", () => {
  filterResults(filterInput.value);
});

filterClearBtn.addEventListener("click", () => {
  filterInput.value = "";
  filterResults(filterInput.value);
});
