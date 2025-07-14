/* --------------------------------- Sorting -------------------------------- */
const sortSelect = document.querySelector(".manage-users--sort-select");

sortSelect.addEventListener("change", () => {
  const sortDirection = "asc";

  sessionStorage.setItem(`manageUsersSortSelected`, sortSelect.value);
  sessionStorage.setItem(`manageUsersSortDirection`, sortDirection);

  window.location.href = `/admin/manage-users?sort=${encodeURIComponent(
    sortSelect.value
  )}&direction=${encodeURIComponent(sortDirection)}`;
});

const sortToggleBtn = document.querySelector(".sort-icon");

sortToggleBtn.addEventListener("click", () => {
  const currentSort =
    sessionStorage.getItem(`manageUsersSortSelected`) || "joined";

  const sortDirection =
    sessionStorage.getItem(`manageUsersSortDirection`) === "desc"
      ? "asc"
      : "desc";

  sessionStorage.setItem(`manageUsersSortDirection`, sortDirection);

  window.location.href = `/admin/manage-users?sort=${encodeURIComponent(
    currentSort
  )}&direction=${encodeURIComponent(sortDirection)}`;
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
  static adminId = null;

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

      await this.initDOMReferences();
      UserManagerSlideout.adminId = this.slideout.dataset.userid;
      await this.populateSlideout();

      if (!this.eventListenersBound) await this.bindEvents();
    } catch (err) {
      console.error(`Failed to initialize UserManagerSlideout: ${err.message}`);
      throw err;
    }
  }

  async loadUser(userId) {
    try {
      this.userId = userId;
      this.userData = await this.#getUserData();
    } catch (err) {
      throw err;
    }
  }

  async initDOMReferences() {
    // Slideout elements
    this.slideout = document.getElementById("slideout-panel");
    this.slideoutBackdrop = document.getElementById("slideout-backdrop");
    this.slideoutCloseBtn = document.getElementById("slideout-close-btn");

    // Fields
    this.authField = document.getElementById("slideout-auth");
    this.roleField = document.getElementById("slideout-role");
    this.bannedField = document.getElementById("slideout-banned");

    // Inputs
    this.usernameInput = document.getElementById("slideout-username");
    this.emailInput = document.getElementById("slideout-email");
    this.timestampField = document.getElementById("slideout-timestamp");

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

    // Submissions sections
    this.submissionsSection = document.getElementById("submissions-section");
    this.pendingSubmissionsTitle = document.getElementById(
      "slideout-pending-submissions-title"
    );
    this.approvedSubmissionsTitle = document.getElementById(
      "slideout-approved-submissions-title"
    );
    this.pendingSubmissionsSection = document.getElementById(
      "slideout-pending-submissions-section"
    );
    this.approvedSubmissionsSection = document.getElementById(
      "slideout-approved-submissions-section"
    );
    this.noSubmissionsText = document.getElementById("slideout-no-submissions");

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

  async createPendingSubmissionElement(submission) {
    const submissionId = submission.id;
    const submitted_at = submission.submitted_at;

    const mainArtist = submission.data.artists.find(
      (artist) => artist.role === "Main"
    ).name;
    const songTitle = submission.data.songTitle;
    const presets = submission.data.synths.flatMap((synth) =>
      synth.presets.map((preset) => preset.name)
    );

    const submissionEl = document.createElement("div");
    submissionEl.classList.add("slideout-user-submission");

    submissionEl.innerHTML = `
      <div class="slideout-user-submission--left">
        <div class="slideout-user-submission--title-container">
          <span class="slideout-user-submission--text"
            >${mainArtist}</span
          >
          <span class="slideout-user-submission--text"
            >${songTitle}</span
          >
        </div>
        <span class="slideout-user-submission--time"
          >${submitted_at}</span
        >
      </div>
      <div
        class="slideout-user-submission--preset-list-container"
      ></div>
      <a
        href="/admin/approvals#entry-${submissionId}"
        class="slideout-submissions-edit-btn"
      >
        <i
          class="fa-solid fa-pen-to-square slideout-submissions-edit-icon"
        ></i>
      </a>
    `;

    const presetListContainer = submissionEl.querySelector(
      ".slideout-user-submission--preset-list-container"
    );

    presets.forEach((preset, i) => {
      const presetEl = document.createElement("div");
      presetEl.classList.add("slideout-user-submission--icon-container");

      if (i === 2 && presets.length > 3) {
        presetEl.innerHTML = `
          <i 
            class="fa-solid fa-sliders slideout-user-submission--icon"
          ></i>
          <span class="slideout-user-submission--text-secondary">
            ...
          </span>
      `;
      } else if (i < 3) {
        presetEl.innerHTML = `
          <i 
            class="fa-solid fa-sliders slideout-user-submission--icon"
          ></i>
          <span class="slideout-user-submission--text-secondary">
            ${preset}
          </span>
      `;
      } else {
        return;
      }

      presetListContainer.appendChild(presetEl);
    });

    this.pendingSubmissionsSection.appendChild(submissionEl);
  }

  async createApprovedSubmissionElement(submission) {
    const songId = submission.song_id;
    const submitted_at = submission.timestamp;

    const mainArtist = submission.artist_name;
    const songTitle = submission.song_title;
    const presets = submission.presets.map((preset) => preset.preset_name);

    const submissionEl = document.createElement("div");
    submissionEl.classList.add("slideout-user-submission");

    submissionEl.innerHTML = `
      <div class="slideout-user-submission--left">
        <div class="slideout-user-submission--title-container">
          <span class="slideout-user-submission--text"
            >${mainArtist}</span
          >
          <span class="slideout-user-submission--text"
            >${songTitle}</span
          >
        </div>
        <span class="slideout-user-submission--time"
          >${submitted_at}</span
        >
      </div>
      <div
        class="slideout-user-submission--preset-list-container"
      ></div>
      <a
        href="/admin/manage-db/${songId}" 
        class="slideout-submissions-edit-btn"
      >
        <i
          class="fa-solid fa-pen-to-square slideout-submissions-edit-icon"
        ></i>
      </a>
    `;

    const presetListContainer = submissionEl.querySelector(
      ".slideout-user-submission--preset-list-container"
    );

    presets.forEach((preset, i) => {
      const presetEl = document.createElement("div");
      presetEl.classList.add("slideout-user-submission--icon-container");

      if (i === 2 && presets.length > 3) {
        presetEl.innerHTML = `
          <i 
            class="fa-solid fa-sliders slideout-user-submission--icon"
          ></i>
          <span class="slideout-user-submission--text-secondary">
            ...
          </span>
      `;
      } else if (i < 3) {
        presetEl.innerHTML = `
          <i 
            class="fa-solid fa-sliders slideout-user-submission--icon"
          ></i>
          <span class="slideout-user-submission--text-secondary">
            ${preset}
          </span>
      `;
      } else {
        return;
      }

      presetListContainer.appendChild(presetEl);
    });

    this.approvedSubmissionsSection.appendChild(submissionEl);
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
    const isSelf = UserManagerSlideout.adminId === this.userId;
    [this.banBtn, this.unbanBtn, this.promoteBtn, this.demoteBtn].forEach(
      (btn) => (btn.disabled = isSelf)
    );

    this.banBtn.classList.toggle("hidden", this.userData.banned);
    this.unbanBtn.classList.toggle("hidden", !this.userData.banned);
    this.promoteBtn.classList.toggle("hidden", this.userData.is_admin);
    this.demoteBtn.classList.toggle("hidden", !this.userData.is_admin);

    // Submissions section
    if (
      this.userData.pendingSubmissions.length ||
      this.userData.submissions.length
    ) {
      this.submissionsSection.classList.remove("hidden");
      this.noSubmissionsText.classList.add("hidden");

      this.pendingSubmissionsSection.innerHTML = "";
      if (this.userData.pendingSubmissions.length) {
        this.pendingSubmissionsTitle.classList.remove("hidden");
        this.pendingSubmissionsSection.classList.remove("hidden");

        this.userData.pendingSubmissions.forEach(async (submission) => {
          await this.createPendingSubmissionElement(submission);
        });
      } else {
        this.pendingSubmissionsTitle.classList.add("hidden");
        this.pendingSubmissionsSection.classList.add("hidden");
      }

      this.approvedSubmissionsSection.innerHTML = "";
      if (this.userData.submissions.length) {
        this.approvedSubmissionsTitle.classList.remove("hidden");
        this.approvedSubmissionsSection.classList.remove("hidden");

        this.userData.submissions.forEach(async (submission) => {
          await this.createApprovedSubmissionElement(submission);
        });
      } else {
        this.approvedSubmissionsTitle.classList.add("hidden");
        this.approvedSubmissionsSection.classList.add("hidden");
      }
    } else {
      this.submissionsSection.classList.add("hidden");
      this.noSubmissionsText.classList.remove("hidden");
    }
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

  showInputError(fieldType) {
    const inputEl = this[`${fieldType}Input`];

    if (!inputEl) return;

    this.clearInputErrors();
    inputEl.classList.add("user-info-input--error");
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
