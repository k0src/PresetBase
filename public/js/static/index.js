const searchInput = document.querySelector(".search-box--input");
const searchButton = document.querySelector(".search-box--button");

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
