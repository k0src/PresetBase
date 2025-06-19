const scrollBtn = document.getElementById("scrollToTop");
const footer = document.querySelector("footer");

if (footer) {
  window.addEventListener("scroll", () => {
    const footerTop = footer.getBoundingClientRect().top + window.scrollY;
    const windowBottom = window.scrollY + window.innerHeight;

    if (window.scrollY > 100) {
      scrollBtn.classList.add("show");

      if (windowBottom > footerTop) {
        const overlap = windowBottom - footerTop;
        scrollBtn.style.bottom = `${overlap}px`;
      } else {
        scrollBtn.style.bottom = "2rem";
      }
    } else {
      scrollBtn.classList.remove("show");
    }
  });
}
