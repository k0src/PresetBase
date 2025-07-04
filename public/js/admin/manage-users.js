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

/* -------------------------------- Slideout -------------------------------- */
class UserManagerSlideout {
  // API Methods
  async #getUserData() {
    try {
      const response = await fetch(
        `/admin/manage-users/user-data/${encodeURIComponent(this.userId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return await response.json();
    } catch (err) {
      throw new Error(`Failed get user data: ${err.message}`);
    }
  }

  async #banUser() {
    try {
      const response = await fetch("/admin/manage-users/ban-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: this.userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return await response.json();
    } catch (err) {
      throw new Error(`Failed to ban user: ${err.message}`);
    }
  }

  async #unbanUser() {
    try {
      const response = await fetch("/admin/manage-users/unban-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: this.userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return await response.json();
    } catch (err) {
      throw new Error(`Failed to unban user: ${err.message}`);
    }
  }

  async #promoteUser() {
    try {
      const response = await fetch("/admin/manage-users/promote-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: this.userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return await response.json();
    } catch (err) {
      throw new Error(`Failed to promote user: ${err.message}`);
    }
  }

  async #demoteUser() {
    try {
      const response = await fetch("/admin/manage-users/demote-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: this.userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return await response.json();
    } catch (err) {
      throw new Error(`Failed to demote user: ${err.message}`);
    }
  }

  async #setUserUsername(newUsername) {
    try {
      const response = await fetch("/admin/manage-users/update-username", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newUsername, userId: this.userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return await response.json();
    } catch (err) {
      throw new Error(`Failed to set username: ${err.message}`);
    }
  }

  #hintTimeout;
  static activeInstance = null;

  constructor() {
    this.userId = null;
    this.userData = null;
    this.eventListenersBound = false;

    this.handleClose = this.handleClose.bind(this);
    this.handleUsernameInput = this.handleUsernameInput.bind(this);
    this.handleApplyChanges = this.handleApplyChanges.bind(this);
    this.handleBan = this.handleBan.bind(this);
    this.handleUnban = this.handleUnban.bind(this);
    this.handlePromote = this.handlePromote.bind(this);
    this.handleDemote = this.handleDemote.bind(this);
  }

  async init(userId) {
    try {
      await this.loadUser(userId);

      if (!this.eventListenersBound) await this.bindEvents();
    } catch (err) {
      console.error(`Failed to initialize UserManagerSlideout: ${err.message}`);
      throw err;
    }
  }

  async loadUser(userId) {
    this.userId = userId;
    this.userData = await this.#getUserData();
    await this.initDOMReferences();
    await this.populateSlideout();
  }

  async initDOMReferences() {
    // Slideout elements
    this.slideout = document.getElementById("slideout-panel");
    this.slideoutBackdrop = document.getElementById("slideout-backdrop");
    this.slideoutCloseBtn = document.getElementById("slideout-close-btn");

    // Fields
    this.usernameInput = document.getElementById("slideout-username");
    this.emailInput = document.getElementById("slideout-email");
    this.timestampField = document.getElementById("slideout-timestamp");
    this.authField = document.getElementById("slideout-auth");
    this.roleField = document.getElementById("slideout-role");
    this.bannedField = document.getElementById("slideout-banned");

    // Buttons
    this.applyChangesBtn = document.getElementById(
      "slideout-apply-changes-btn"
    );
    this.banBtn = document.getElementById("ban-btn");
    this.unbanBtn = document.getElementById("unban-btn");
    this.promoteBtn = document.getElementById("promote-btn");
    this.demoteBtn = document.getElementById("demote-btn");

    // Hints
    this.usernameHint = document.getElementById("slideout-username-hint");
    this.actionsHint = document.getElementById("slideout-actions-hint");

    // Submissions section

    // List entry fields
    const userEntry = document.querySelector(
      `.user-entry[data-userid="${this.userId}"]`
    );
    this.usernameListEntryField = userEntry
      ? userEntry.querySelector(`.user--username`)
      : null;

    this.roleListEntryField = userEntry
      ? userEntry.querySelector(`.user--role`)
      : null;
  }

  // Event listeners
  async handleClose() {
    this.close();
  }

  async handleUsernameInput() {
    const input = this.usernameInput.value.trim();
    this.applyChangesBtn.disabled = input.length < 3 || input.length > 30;
  }

  async handleApplyChanges() {
    try {
      const newUsername = this.usernameInput.value.trim();
      const response = await this.#setUserUsername(newUsername);

      this.userData.username = response.username;
      this.usernameListEntryField.textContent = response.username;

      this.showInputSuccess("username");
      this.showHintSuccess("Username changed successfully.", "username");
      this.disableApplyChangesBtn();
    } catch (err) {
      this.showInputError("username");
      this.showHintError(err.message, "username");
      console.error(err);
    }
  }

  async handleBan() {
    try {
      const response = await this.#banUser();

      this.banBtn.classList.add("hidden");
      this.unbanBtn.classList.remove("hidden");

      this.userData.banned = true;
      this.bannedField.textContent = "True";

      this.showHintSuccess(response.message, "actions");
    } catch (err) {
      this.showHintError(err.message, "actions");
      console.error(err);
    }
  }

  async handleUnban() {
    try {
      const response = await this.#unbanUser();

      this.unbanBtn.classList.add("hidden");
      this.banBtn.classList.remove("hidden");

      this.userData.banned = false;
      this.bannedField.textContent = "False";

      this.showHintSuccess(response.message, "actions");
    } catch (err) {
      this.showHintError(err.message, "actions");
      console.error(err);
    }
  }

  async handlePromote() {
    try {
      const response = await this.#promoteUser();

      this.promoteBtn.classList.add("hidden");
      this.demoteBtn.classList.remove("hidden");

      this.userData.is_admin = true;
      this.roleField.textContent = "Admin";
      this.roleListEntryField.textContent = "Admin";

      this.showHintSuccess(response.message, "actions");
    } catch (err) {
      this.showHintError(err.message, "actions");
      console.error(err);
    }
  }

  async handleDemote() {
    try {
      const response = await this.#demoteUser();

      this.demoteBtn.classList.add("hidden");
      this.promoteBtn.classList.remove("hidden");

      this.userData.is_admin = false;
      this.roleField.textContent = "User";
      this.roleListEntryField.textContent = "User";

      this.showHintSuccess(response.message, "actions");
    } catch (err) {
      this.showHintError(err.message, "actions");
      console.error(err);
    }
  }

  async bindEvents() {
    if (this.eventListenersBound) return;

    this.slideoutCloseBtn.addEventListener(
      "click",
      this.handleClose.bind(this)
    );
    this.slideoutBackdrop.addEventListener(
      "click",
      this.handleClose.bind(this)
    );
    this.usernameInput.addEventListener(
      "input",
      this.handleUsernameInput.bind(this)
    );
    this.applyChangesBtn.addEventListener(
      "click",
      this.handleApplyChanges.bind(this)
    );
    this.banBtn.addEventListener("click", this.handleBan.bind(this));
    this.unbanBtn.addEventListener("click", this.handleUnban.bind(this));
    this.promoteBtn.addEventListener("click", this.handlePromote.bind(this));
    this.demoteBtn.addEventListener("click", this.handleDemote.bind(this));

    this.eventListenersBound = true;
  }

  async populateSlideout() {
    // Fields
    this.usernameInput.value = this.userData.username;
    this.emailInput.value = this.userData.email;
    this.timestampField.textContent = this.userData.timestamp;
    this.authField.textContent = this.userData.authenticated_with;
    this.roleField.textContent = this.userData.is_admin ? "Admin" : "User";
    this.bannedField.textContent = this.userData.banned ? "True" : "False";

    // Buttons
    this.banBtn.classList.toggle("hidden", this.userData.banned);
    this.unbanBtn.classList.toggle("hidden", !this.userData.banned);
    this.promoteBtn.classList.toggle("hidden", this.userData.is_admin);
    this.demoteBtn.classList.toggle("hidden", !this.userData.is_admin);

    // Submissions section
  }

  showInputError(fieldType) {
    const inputEl = this[`${fieldType}Input`];

    if (!inputEl) return;

    this.clearInputErrors();
    inputEl.classList.add("user-info-input--error");
  }

  showInputSuccess(fieldType) {
    const inputEl = this[`${fieldType}Input`];

    if (!inputEl) return;

    this.clearInputErrors();
    inputEl.classList.remove("user-info-input--error");
  }

  showHintError(msg, fieldType) {
    const hintEl = this[`${fieldType}Hint`];

    if (!hintEl) return;

    this.clearHints();
    hintEl.classList.remove("hidden");
    hintEl.textContent = msg;
    hintEl.classList.remove("input-hint--success");
    hintEl.classList.add("input-hint--error");

    if (this.#hintTimeout) {
      clearTimeout(this.#hintTimeout);
    }
    this.#hintTimeout = setTimeout(() => {
      this.clearHints();
      this.#hintTimeout = null;
    }, 5000);
  }

  showHintSuccess(msg, fieldType) {
    const hintEl = this[`${fieldType}Hint`];

    if (!hintEl) return;

    this.clearHints();
    hintEl.classList.remove("hidden");
    hintEl.textContent = msg;
    hintEl.classList.remove("input-hint--error");
    hintEl.classList.add("input-hint--success");

    if (this.#hintTimeout) {
      clearTimeout(this.#hintTimeout);
    }
    this.#hintTimeout = setTimeout(() => {
      this.clearHints();
      this.#hintTimeout = null;
    }, 5000);
  }

  disableApplyChangesBtn() {
    this.applyChangesBtn.disabled = true;
  }

  clearHints() {
    this.usernameHint.classList.add("hidden");
    this.usernameHint.textContent = "";
    this.actionsHint.classList.add("hidden");
    this.actionsHint.textContent = "";
  }

  clearInputErrors() {
    this.usernameInput.classList.remove("user-info-input--error");
  }

  show() {
    this.slideout.classList.remove("hidden");
    this.slideoutBackdrop.classList.remove("hidden");
  }

  close() {
    this.slideout.classList.add("hidden");
    this.slideoutBackdrop.classList.add("hidden");
    this.disableApplyChangesBtn();
    this.clearHints();
    this.clearInputErrors();
  }
}

let currentSlideoutInstance = null;

const showSlideOut = async function (btn) {
  const userId = btn.closest(".user-entry").dataset.userid;

  if (!currentSlideoutInstance) {
    currentSlideoutInstance = new UserManagerSlideout();
  }

  await currentSlideoutInstance.init(userId);
  currentSlideoutInstance.show();
};
