const navSearchInput = document.querySelector(".navbar-search--input");

/* --------------------------------- Search --------------------------------- */
navSearchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    if (navSearchInput.value) {
      const searchValue = navSearchInput.value.trim().toLowerCase();
      window.location.href = `/search?query=${encodeURIComponent(searchValue)}`;
      navSearchInput.value = "";
    }
  }
});

document.addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.key.toLowerCase() === "k") {
    event.preventDefault();
    navSearchInput.focus();
  }
});

/* ------------------------------- Mobile Nav ------------------------------- */
const btnMobileNav = document.querySelector(".button-mobile-nav");
const mobileNav = document.querySelector(".mobile-nav");
const iconBars = btnMobileNav.querySelector(".fa-bars");
const iconClose = btnMobileNav.querySelector(".fa-xmark");
const mobileSearchInput = document.querySelector(".mobile-nav-search-input");

btnMobileNav.addEventListener("click", () => {
  mobileNav.classList.toggle("nav-open");
  iconBars.classList.toggle("hidden");
  iconClose.classList.toggle("hidden");
});

mobileSearchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    if (mobileSearchInput.value) {
      const searchValue = mobileSearchInput.value.trim().toLowerCase();
      window.location.href = `/search?query=${encodeURIComponent(searchValue)}`;
      mobileSearchInput.value = "";
    }
  }
});
