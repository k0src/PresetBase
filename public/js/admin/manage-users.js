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

/* -------------------------------- Slide Out ------------------------------- */
const populateSlideOut = async function (user) {
  document.getElementById("slideout-username").value = user.username;
  document.getElementById("slideout-email").value = user.email;
  document.getElementById("slideout-timestamp").textContent = user.timestamp;
  document.getElementById("slideout-auth").textContent = user.auth;
  document.getElementById("slideout-role").textContent = user.role;
};

const createUserData = async function (userEntry) {
  const user = {
    username: userEntry.querySelector(".user--username").textContent,
    email: userEntry.querySelector(".user--email").textContent,
    timestamp: userEntry.querySelector(".user--timestamp").textContent,
    auth: userEntry.querySelector(".user--auth").textContent,
    role: userEntry.querySelector(".user--role").textContent,
    id: userEntry.dataset.userid,
  };
  return user;
};

const handleUsernameInput = async function (user, userEntry) {
  const userId = Number(user.id);

  const applyChangesBtn = document.getElementById("apply-changes-btn");
  const usernameInput = document.getElementById("slideout-username");
  const usernameInputHint = document.getElementById("username-hint");

  const usernameEntryField = userEntry.querySelector(`.user--username`);

  const usernameInputClone = usernameInput.cloneNode(true);
  usernameInput.parentNode.replaceChild(usernameInputClone, usernameInput);
  const applyChangesBtnClone = applyChangesBtn.cloneNode(true);
  applyChangesBtn.parentNode.replaceChild(
    applyChangesBtnClone,
    applyChangesBtn
  );

  usernameInputClone.addEventListener("input", () => {
    const username = usernameInputClone.value.trim();
    if (username.length < 3 || username.length > 30) {
      applyChangesBtnClone.disabled = true;
    } else {
      applyChangesBtnClone.disabled = false;
    }
  });

  applyChangesBtnClone.addEventListener("click", async () => {
    try {
      const newUsername = usernameInputClone.value.trim();

      const response = await fetch("/admin/manage-users/update-username", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newUsername, userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();

      usernameInputClone.value = data.username;
      usernameEntryField.textContent = data.username;
      usernameInputClone.classList.remove("user-info-input--error");
      applyChangesBtnClone.disabled = true;
      usernameInputHint.textContent = "Username changed successfully.";
      usernameInputHint.classList.remove("hidden");
      usernameInputHint.classList.remove("input-hint--error");
      usernameInputHint.classList.add("input-hint--success");
    } catch (err) {
      usernameInputClone.classList.add("user-info-input--error");
      usernameInputHint.textContent = err.message;
      usernameInputHint.classList.remove("hidden");
      usernameInputHint.classList.remove("input-hint--success");
      usernameInputHint.classList.add("input-hint--error");
      console.error(err);
    }
  });
};

const showSlideOut = async function (btn) {
  const slideOut = document.getElementById("slideout-panel");
  const slideOutBackdrop = document.getElementById("slideout-backdrop");
  const userEntry = btn.closest(".user-entry");

  const user = await createUserData(userEntry);
  await populateSlideOut(user);
  await handleUsernameInput(user, userEntry);

  slideOut.classList.remove("hidden");
  slideOutBackdrop.classList.remove("hidden");
};

const closeSlideOut = function () {
  const slideOut = document.getElementById("slideout-panel");
  const slideOutBackdrop = document.getElementById("slideout-backdrop");
  const usernameInputHint = document.getElementById("username-hint");
  const usernameInput = document.getElementById("slideout-username");
  const applyChangesBtn = document.getElementById("apply-changes-btn");

  slideOut.classList.add("hidden");
  slideOutBackdrop.classList.add("hidden");
  usernameInputHint.classList.add("hidden");
  usernameInput.classList.remove("user-info-input--error");
  applyChangesBtn.disabled = true;
};
