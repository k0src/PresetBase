const fetchSearchSuggestions = async function (query, limit) {
  const url = `/api/getallnames?query=${encodeURIComponent(
    query
  )}&limit=${limit}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Search suggestions fetch failed");

  const data = await res.json();
  return data.map((row) => row.name);
};

document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector(".navbar-search--input");
  const dropdown = document.querySelector(".autocomplete-dropdown--nav");

  const searchForQuery = function (query) {
    if (query) {
      const searchValue = query.trim().toLowerCase();
      window.location.href = `/search?query=${encodeURIComponent(searchValue)}`;
      input.value = "";
    }
  };

  let selectedIndex = -1;
  let debounceTimeout;
  handleKeyboardNavigation(
    input,
    dropdown,
    () => selectedIndex,
    (val) => {
      selectedIndex = val;
    }
  );

  input.addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
      const query = input.value.trim();
      if (query.length === 0) {
        hideDropdown();
        return;
      }

      try {
        const results = await fetchSearchSuggestions(query, 5);
        renderDropdown(results);
      } catch (err) {
        console.error("Error fetching search suggestions: ", err);
      }

      selectedIndex = -1;
    }, 150);
  });

  const renderDropdown = function (items) {
    dropdown.innerHTML = "";
    if (items.length === 0) {
      hideDropdown();
      return;
    }

    items.forEach((item, index) => {
      const listItem = item;
      const li = document.createElement("li");
      li.textContent = listItem;
      li.setAttribute("data-index", index);

      li.addEventListener("click", () => {
        hideDropdown();
        searchForQuery(listItem);
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

  function handleKeyboardNavigation(
    input,
    dropdown,
    getSelectedIndex,
    setSelectedIndex
  ) {
    input.addEventListener("keydown", (e) => {
      const items = dropdown.querySelectorAll("li");

      if (items.length === 0) return;

      let currentIndex = getSelectedIndex();

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          currentIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          updateSelection(items, currentIndex);
          setSelectedIndex(currentIndex);
          break;

        case "ArrowUp":
          e.preventDefault();
          currentIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          updateSelection(items, currentIndex);
          setSelectedIndex(currentIndex);
          break;

        case "Enter":
          e.preventDefault();
          if (currentIndex >= 0 && items[currentIndex]) {
            hideDropdown(dropdown);
            setSelectedIndex(-1);
            searchForQuery(items[currentIndex].textContent);
          }
          break;

        case "Escape":
          hideDropdown(dropdown);
          setSelectedIndex(-1);
          break;
      }
    });
  }

  function updateSelection(items, newIndex) {
    items.forEach((item) => item.classList.remove("selected"));

    if (newIndex >= 0 && items[newIndex]) {
      items[newIndex].classList.add("selected");

      items[newIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = input.value.trim();
      searchForQuery(query);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      input.focus();
    }
  });
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
