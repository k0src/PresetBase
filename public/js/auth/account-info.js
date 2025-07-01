/* -------------------------- Changing account info ------------------------- */
// This logic will need to be changed when email/password sign in is added
const applyChangesBtn = document.getElementById("apply-changes-btn");
const usernameInput = document.getElementById("username");
const usernameInputHint = document.getElementById("username-hint");

usernameInput.addEventListener("input", () => {
  const username = usernameInput.value.trim();
  if (username.length < 3 || username.length > 30) {
    applyChangesBtn.disabled = true;
  } else {
    applyChangesBtn.disabled = false;
  }
});

applyChangesBtn.addEventListener("click", async () => {
  try {
    const newUsername = usernameInput.value.trim();

    const response = await fetch("/account-info/update-username", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newUsername }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const data = await response.json();

    usernameInput.value = data.username;
    usernameInput.classList.remove("account-info-input--error");
    applyChangesBtn.disabled = true;
    usernameInputHint.textContent = "Username changed successfully.";
    usernameInputHint.classList.remove("hidden");
    usernameInputHint.classList.add("input-hint--success");
  } catch (err) {
    usernameInput.classList.add("account-info-input--error");
    usernameInputHint.textContent = err.message;
    usernameInputHint.classList.remove("hidden");
    usernameInputHint.classList.add("input-hint--error");
    console.error(err);
  }
});

/* -------------------------------- Sign Out -------------------------------- */
const signOutBtn = document.getElementById("sign-out-btn");
const footerHint = document.getElementById("footer-hint");

signOutBtn.addEventListener("click", async () => {
  try {
    const response = await fetch("/account-info/sign-out", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    window.location.href = "/";
  } catch (err) {
    footerHint.textContent = err.message;
    footerHint.classList.remove("hidden");
    footerHint.classList.add("input-hint--error");
    console.error(err);
  }
});

/* ------------------------------ Delete Modal ------------------------------ */
const deleteAccountBtn = document.getElementById("delete-account-btn");
const modal = document.querySelector(".delete-account-modal");
const modalOverlay = document.querySelector(".delete-account-modal-overlay");
const modalCancelBtn = document.querySelector(".delete-account-btn--cancel");
const modalDeleteBtn = document.querySelector(".delete-account-btn--delete");

const closeDeleteModal = function () {
  modalOverlay.style.display = "none";
};

const showDeleteModal = function (btn) {
  modalOverlay.style.display = "block";

  modalCancelBtn.addEventListener("click", closeDeleteModal);
  modalOverlay.addEventListener("click", closeDeleteModal);
  document.addEventListener("keydown", function escListener(e) {
    if (e.key === "Escape") {
      closeDeleteModal();
      document.removeEventListener("keydown", escListener);
    }
  });

  modalDeleteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    deleteAccount();
    closeDeleteModal();
  });
};

deleteAccountBtn.addEventListener("click", () => {
  showDeleteModal();
});

/* ----------------------------- Delete Account ----------------------------- */
const deleteAccount = async function () {
  try {
    const response = await fetch("/account-info/delete-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    window.location.href = "/";
  } catch (err) {
    footerHint.textContent = err.message;
    footerHint.classList.remove("hidden");
    console.error(err);
  }
};
