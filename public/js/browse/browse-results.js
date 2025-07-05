const noSortSelectPages = ["hot", "popular", "recent"];
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

sortSelect?.addEventListener("change", () => {
  const sortDirection = "asc";

  sessionStorage.setItem(`${currentPage}SortSelected`, sortSelect.value);
  sessionStorage.setItem(`${currentPage}SortDirection`, sortDirection);

  window.location.href = `/browse/${currentPage}?sort=${encodeURIComponent(
    sortSelect.value
  )}&direction=${encodeURIComponent(sortDirection)}`;
});

const sortToggleBtn = document.querySelector(".sort-icon");

sortToggleBtn.addEventListener("click", () => {
  const currentSort =
    sessionStorage.getItem(`${currentPage}SortSelected`) || "added";

  const sortDirection =
    sessionStorage.getItem(`${currentPage}SortDirection`) === "desc"
      ? "asc"
      : "desc";

  sessionStorage.setItem(`${currentPage}SortDirection`, sortDirection);

  if (noSortSelectPages.includes(currentPage)) {
    window.location.href = `/browse/${currentPage}?direction=${encodeURIComponent(
      sortDirection
    )}`;
  } else {
    window.location.href = `/browse/${currentPage}?sort=${encodeURIComponent(
      currentSort
    )}&direction=${encodeURIComponent(sortDirection)}`;
  }
});

/* ---------------------------- View mode toggle ---------------------------- */
const viewModeToggle = document.getElementById("view-toggle");

const setToggleViewMode = function (mode) {
  const grid = document.querySelector(".search-results-grid--container");
  const list = document.querySelector(".search-results-list--container");
  if (mode === "grid") {
    grid.classList.remove("hidden");
    list.classList.add("hidden");
    viewModeToggle.setAttribute("data-mode", "grid");
  } else {
    grid.classList.add("hidden");
    list.classList.remove("hidden");
    viewModeToggle.setAttribute("data-mode", "list");
  }
};

viewModeToggle.addEventListener("click", () => {
  const currentMode = viewModeToggle.getAttribute("data-mode");
  const mode = currentMode === "list" ? "grid" : "list";
  setToggleViewMode(mode);
  sessionStorage.setItem(`user${currentPage}ViewMode`, mode);
});

/* ------------------------- Setting values on load ------------------------- */
const setSortSelectValue = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const sortParam = urlParams.get("sort");

  if (sortSelect) {
    if (sortParam) {
      sortSelect.value = sortParam;
      sessionStorage.setItem(`${currentPage}SortSelected`, sortParam);
    } else {
      sessionStorage.removeItem(`${currentPage}SortSelected`);
      sortSelect.value = "";
    }
  }
};

const setUserView = function () {
  const userView =
    sessionStorage.getItem(`user${currentPage}ViewMode`) || "list";
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
      entry.classList.toggle("hidden", lowerQuery && !matchFound);
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
