const sortDropdownBtn = document.querySelector(".result-sort-btn");
const sortDropdownItems = document.querySelectorAll(
  ".result-sort-content--item"
);
const sortDropdownContent = document.querySelector(".result-sort-content");
const filterInput = document.querySelector(".result-filter--input");
const genreTags = document.querySelectorAll(".genre-tag");
const filterClearBtn = document.querySelector(".result-filter--clear");
const viewModeBtns = document.querySelectorAll(".results-view-btn");

/* SORTING */
const sortPresets = function (key) {
  window.location.href = `/browse/presets?sort=${encodeURIComponent(key)}`;
};

sortDropdownBtn.addEventListener("click", () => {
  sortDropdownContent.classList.toggle("result-sort-content--show");
});

sortDropdownItems.forEach((item) => {
  item.addEventListener("click", () => {
    sortPresets(item.id);
  });
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
