const searchBox = document.querySelector(".search-box");
const searchInput = document.querySelector(".search-input");
const searchButton = document.querySelector(".search-button");

searchButton.addEventListener("click", function () {
  if (searchInput.value) {
    const searchValue = searchInput.value.trim().toLowerCase();
    window.location.href = `/search?query=${encodeURIComponent(searchValue)}`;
    searchInput.value = "";
  }
});

searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    if (searchInput.value) {
      const searchValue = searchInput.value.trim().toLowerCase();
      window.location.href = `/search?query=${encodeURIComponent(searchValue)}`;
      searchInput.value = "";
    }
  }
});
