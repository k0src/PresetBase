const scrollBtn = document.getElementById("scrollToTop");
window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    scrollBtn.classList.add("show");
  } else {
    scrollBtn.classList.remove("show");
  }
});

scrollBtn.addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
