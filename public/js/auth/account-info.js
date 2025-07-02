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
const deleteModalOverlay = document.querySelector(
  ".delete-account-modal-overlay"
);
const deleteModalCancelBtn = document.querySelector(
  ".delete-account-btn--cancel"
);
const deleteModalDeleteBtn = document.querySelector(
  ".delete-account-btn--delete"
);

const closeDeleteAccountModal = function () {
  deleteModalOverlay.style.display = "none";
};

const showDeleteAccountModal = function () {
  deleteModalOverlay.style.display = "block";

  deleteModalCancelBtn.addEventListener("click", closeDeleteAccountModal);
  deleteModalOverlay.addEventListener("click", closeDeleteAccountModal);
  document.addEventListener("keydown", function escListener(e) {
    if (e.key === "Escape") {
      closeDeleteAccountModal();
      document.removeEventListener("keydown", escListener);
    }
  });

  deleteModalDeleteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    deleteAccount();
    closeDeleteAccountModal();
  });
};

deleteAccountBtn.addEventListener("click", () => {
  showDeleteAccountModal();
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

/* -------------------- Delete Pending Submissions Modal -------------------- */
const pendingModalOverlay = document.querySelector(
  ".delete-pending-modal-overlay"
);
const pendingModalCancelBtn = document.querySelector(
  ".delete-pending-btn--cancel"
);
const pendingModalDeleteBtn = document.querySelector(
  ".delete-pending-btn--delete"
);

const closeDeletePendingModal = function () {
  pendingModalOverlay.style.display = "none";
};

const showDeletePendingModal = function (btn) {
  const submissionId = btn.parentNode.querySelector(
    "[name=submissionId]"
  ).value;
  const pendingSubmissionEntry = btn.closest(".user-submission--pending");

  pendingModalOverlay.style.display = "block";

  pendingModalCancelBtn.addEventListener("click", closeDeletePendingModal);
  pendingModalOverlay.addEventListener("click", closeDeletePendingModal);
  document.addEventListener("keydown", function escListener(e) {
    if (e.key === "Escape") {
      closeDeletePendingModal();
      document.removeEventListener("keydown", escListener);
    }
  });

  pendingModalDeleteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    deletePendingSubmission(submissionId);
    removePendingSubmissionElement(pendingSubmissionEntry);
    closeDeletePendingModal();
  });
};

/* ----------------------- Remove Pending Submission Element ---------------- */
const removePendingSubmissionElement = function (element) {
  const pendingSubmissionsContainer = element.closest(
    ".pending-submissions-container"
  );

  element.remove();

  if (pendingSubmissionsContainer.children.length === 0) {
    const pendingHeader = document.querySelector(".pending--header");
    pendingHeader.remove();
    pendingSubmissionsContainer.remove();
  }
};

/* ------------------------ Delete Pending Submission ----------------------- */
const deletePendingSubmission = async function (submissionId) {
  try {
    const response = await fetch(
      `/account-info/delete-pending-submission/${encodeURIComponent(
        submissionId
      )}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
  } catch (err) {
    console.error(err);
    return;
  }
};
