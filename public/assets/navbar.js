const navSearchInput = document.querySelector(".navbar-search--input");

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
