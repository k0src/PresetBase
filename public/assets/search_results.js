const filterBtns = document.querySelectorAll(".filter-btn");
const sections = document.querySelectorAll(".section");

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
  });
});
