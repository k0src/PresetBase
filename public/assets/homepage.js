const searchBox = document.querySelector(".search-box");
const searchInput = document.querySelector(".search-input");
const searchButton = document.querySelector(".search-button");
const logo = document.querySelector(".logo");

searchButton.addEventListener("click", (e) => {
  if (searchInput.value) {
    const searchValue = searchInput.value.trim().toLowerCase();
    window.location.href = `/search?query=${encodeURIComponent(searchValue)}`;
    searchInput.value = "";
  }
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (searchInput.value) {
      const searchValue = searchInput.value.trim().toLowerCase();
      window.location.href = `/search?query=${encodeURIComponent(searchValue)}`;
      searchInput.value = "";
    }
  }
});

logo.addEventListener("click", (e) => {});
