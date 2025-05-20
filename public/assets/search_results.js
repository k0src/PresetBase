const filterBtns = document.querySelectorAll(".filter-btn");
const sections = document.getElementsByClassName("section");

const toggleFilterButtons = function () {
  filterBtns.forEach((btn) => {
    if (btn.classList.contains("filter-btn-active")) {
      btn.classList.remove("filter-btn-active");
    }
  });
};

filterBtns.forEach((btn) =>
  btn.addEventListener("click", function () {
    toggleFilterButtons();
    btn.classList.add("filter-btn-active");
    showFilteredSections(btn.id);
  })
);

const showFilteredSections = function (filter) {
  if (filter === "filter-all") {
    for (let i = 0; i < sections.length; i++) {
      sections[i].style.display = "block";
    }
  } else if (filter === "filter-songs") {
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].classList.contains("songs-section")) {
        sections[i].style.display = "block";
      } else {
        sections[i].style.display = "none";
      }
    }
  } else if (filter === "filter-artists") {
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].classList.contains("artists-section")) {
        sections[i].style.display = "block";
      } else {
        sections[i].style.display = "none";
      }
    }
  } else if (filter === "filter-albums") {
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].classList.contains("albums-section")) {
        sections[i].style.display = "block";
      } else {
        sections[i].style.display = "none";
      }
    }
  } else if (filter === "filter-synths") {
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].classList.contains("synths-section")) {
        sections[i].style.display = "block";
      } else {
        sections[i].style.display = "none";
      }
    }
  } else if (filter === "filter-presets") {
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].classList.contains("presets-section")) {
        sections[i].style.display = "block";
      } else {
        sections[i].style.display = "none";
      }
    }
  }
};
