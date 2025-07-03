/* --------------------------------- Sorting -------------------------------- */
const sortSelect = document.querySelector(".manage-users--sort-select");

sortSelect.addEventListener("change", () => {
  sessionStorage.setItem(`manageUsersSortSelected`, sortSelect.value);

  window.location.href = `/admin/manage-users?sort=${encodeURIComponent(
    sortSelect.value
  )}`;
});

/* ------------------------- Setting values on load ------------------------- */
const setSortSelectValue = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const sortParam = urlParams.get("sort");

  if (sortParam) {
    sortSelect.value = sortParam;
    sessionStorage.setItem(`manageUsersSortSelected`, sortParam);
  } else {
    sessionStorage.removeItem(`manageUsersSortSelected`);
    sortSelect.value = "";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setSortSelectValue();
});

/* ---------------------------- Filtering results --------------------------- */
const filterInput = document.querySelector(".manage-users-filter--input");
const filterClearBtn = document.querySelector(".result-filter--clear");

const filterUsers = function (query) {
  const lowerQuery = query.trim().toLowerCase();

  document.querySelectorAll(".user-entry").forEach((entry) => {
    const primaryEls = entry.querySelectorAll(`.user-entry--primary`);
    const matchFound = Array.from(primaryEls).some((el) =>
      el.textContent.toLowerCase().includes(lowerQuery)
    );

    entry.classList.toggle("hidden", lowerQuery && !matchFound);
  });
};

filterInput.addEventListener("input", () => {
  filterUsers(filterInput.value);
});

filterClearBtn.addEventListener("click", () => {
  filterInput.value = "";
  filterUsers(filterInput.value);
});
