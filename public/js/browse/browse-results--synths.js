const currentPath = window.location.pathname.split("/")[2];
console.log(currentPath);

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

  window.location.href = `/browse/synths?sort=${encodeURIComponent(
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
  localStorage.setItem("userSynthsViewMode", mode);
});

/* ------------------------- Setting values on load ------------------------- */
const setSortSelectValue = function () {
  const sortValue = localStorage.getItem("synthSortSelected");
  if (sortValue) {
    sortSelect.value = sortValue;
  }
};

const setUserView = function () {
  const userView = localStorage.getItem("userSynthsViewMode") || "list";
  setToggleViewMode(userView);
};

document.addEventListener("DOMContentLoaded", () => {
  setSortSelectValue();
  setUserView();
});

/* ---------------------------- Filtering results --------------------------- */
const filterInput = document.querySelector(".browse-results-filter--input");
const filterClearBtn = document.querySelector(".result-filter--clear");

const filterList = function (query) {
  const lowerQuery = query.trim().toLowerCase();

  document.querySelectorAll(".result-entry").forEach((entry) => {
    const synth = entry
      .querySelector(".result-entry--primary")
      .textContent.toLowerCase();
    const manufacturer = entry
      .querySelector(".result-entry--secondary")
      .textContent.toLowerCase();

    const matches =
      !lowerQuery ||
      synth.includes(lowerQuery) ||
      manufacturer.includes(lowerQuery);

    entry.classList.toggle("hide", !matches);
  });
};

const filterCards = function (query) {
  const lowerQuery = query.trim().toLowerCase();

  document.querySelectorAll(".card-entry").forEach((entry) => {
    const synth = entry
      .querySelector(".card-entry--primary")
      .textContent.toLowerCase();
    const manufacturer = entry
      .querySelector(".card-entry--secondary")
      .textContent.toLowerCase();

    const matches =
      !lowerQuery ||
      synth.includes(lowerQuery) ||
      manufacturer.includes(lowerQuery);

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

filterClearBtn.addEventListener("click", () => {
  filterInput.value = "";
  filterResults(filterInput.value);
});
