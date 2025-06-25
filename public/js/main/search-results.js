const sections = document.querySelectorAll(".search-results--section");
const filterSelect = document.querySelector(".search-results--filter-select");

if (filterSelect) {
  filterSelect.addEventListener("change", () => {
    const filter = filterSelect.value;

    sections.forEach((section) => {
      const show =
        filter === "all" || section.classList.contains(`--section-${filter}`);

      section.style.display = show ? "block" : "none";
    });
  });
}
