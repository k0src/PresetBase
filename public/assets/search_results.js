const filterBtns = document.querySelectorAll(".filter-btn");
const sections = document.querySelectorAll(".section");
const resultsSection = document.querySelector(".results");
const noResultsElement = document.querySelector(".no-results");

const totalResults = document.querySelectorAll(".result-card").length;

if (totalResults === 0) {
  noResultsElement.style.display = "flex";
  document.querySelector(".results").style.display = "none";
} else {
  noResultsElement.style.display = "none";
}

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.getAttribute("data-filter");

    document
      .querySelector(".filter-btn-active")
      ?.classList.remove("filter-btn-active");
    btn.classList.add("filter-btn-active");

    sections.forEach((section) => {
      const show =
        filter === "all" || section.classList.contains(`${filter}-section`);
      section.style.display = show ? "block" : "none";

      // retrigger animation
      section.classList.remove("animate");
      void section.offsetWidth;
      section.classList.add("animate");
    });

    let activeSections = false;

    sections.forEach((section) => {
      if (section.style.display === "block") {
        activeSections = true;
      }
    });

    if (activeSections) {
      resultsSection.style.display = "block";
      noResultsElement.style.display = "none";
    } else {
      resultsSection.style.display = "none";
      noResultsElement.style.display = "flex";
    }
  });
});
