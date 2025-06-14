import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/dist/fuse.mjs";

/* ------------------------------ Search Button ----------------------------- */
const searchInput = document.querySelector(".search-box--input");
const searchButton = document.querySelector(".search-box--button");

const searchForQuery = function (query) {
  if (query) {
    const searchValue = query.trim().toLowerCase();
    window.location.href = `/search?query=${encodeURIComponent(searchValue)}`;
    searchInput.value = "";
  }
};

searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  searchForQuery(query);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const query = searchInput.value.trim();
    searchForQuery(query);
  }
});

/* ----------------------- Search Suggestions - Fuzzy ----------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector(".search-box--input");
  const dropdown = document.querySelector(".autocomplete-dropdown");

  const data = window.__SEARCH_DATA__;
  const dataset = [
    ...data.songs.map((s) => ({ label: s.song_title })),
    ...data.artists.map((a) => ({ label: a.artist_name })),
    ...data.albums.map((a) => ({ label: a.album_title })),
    ...data.synths.map((s) => ({ label: s.synth_name })),
    ...data.presets.map((p) => ({ label: p.preset_name })),
  ];

  const fuse = new Fuse(dataset, {
    keys: ["label"],
    includeScore: true,
    threshold: 0.4,
    distance: 100,
    ignoreLocation: true,
  });

  let debounceTimeout;
  input.addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const query = input.value.trim();
      if (query.length === 0) {
        hideDropdown();
        return;
      }

      const results = fuse
        .search(query)
        .slice(0, 8)
        .map((r) => r.item);
      renderDropdown(results);
    }, 150);
  });

  const renderDropdown = function (items) {
    dropdown.innerHTML = "";
    if (items.length === 0) {
      hideDropdown();
      return;
    }

    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.label}`;
      li.addEventListener("click", () => {
        hideDropdown();
        searchForQuery(item.label);
      });
      dropdown.appendChild(li);
    });

    dropdown.classList.add("show");
    dropdown.classList.remove("hidden");
  };

  function hideDropdown() {
    dropdown.classList.remove("show");
    dropdown.classList.add("hidden");
  }

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      hideDropdown();
    }
  });
});
