import * as Components from "../components/Components.js";

/* ------------------------------ Table Config ------------------------------ */
const TABLE_CONFIG = {
  title: "User",
  id: "id",
  headerClassName: "result-columns grid-layout--users",
  entryClassName: "grid-layout--users user-entry",
  rowNumberClassName: "user-entry--number",
  columns: [
    {
      key: "username",
      label: "Username",
      className: "user-entry--primary user--username",
    },
    {
      key: "email",
      label: "Email",
      className: "user-entry--primary user--email",
    },
    {
      key: "timestamp",
      label: "Join Date",
      className: "user-entry--date user--timestamp",
    },
    {
      key: "authenticated_with",
      label: "Auth Provider",
      className: "user-entry--auth user--auth",
    },
    {
      key: "is_admin",
      label: "Is Admin",
      className: "user-entry--role user--role",
    },
  ],
  sortKeys: [
    { label: "Username", value: "users.username" },
    { label: "Email", value: "users.email" },
    { label: "Joined", value: "users.timestamp" },
    { label: "Auth Provider", value: "users.authenticated_with" },
  ],
  filterForKeys: ["username", "email"],
  filterSelector: "user-entry",
  actions: [
    {
      type: "button",
      className: "hidden-btn",
      content: `<i class="fa-solid fa-pen-to-square edit--icon"></i>`,
      callback: async (row) => {
        try {
          if (!window.userSlideoutInstance) {
            window.userSlideoutInstance = new UserManagerSlideout();
          }

          await window.userSlideoutInstance.init(row.id);
          window.userSlideoutInstance.show();
        } catch (err) {
          console.error(`Failed to initialize slideout: ${err.message}`);
        }
      },
    },
  ],
};

class UserTableDataManager {
  static async fetchTableData(sortKey = "", sortDirection = "") {
    try {
      const response = await fetch(
        `/admin/manage-users/user-data?sortKey=${encodeURIComponent(
          sortKey
        )}&sortDirection=${encodeURIComponent(sortDirection)}`,
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
      throw new Error(`Failed to get table data: ${err.message}`);
    }
  }
}

class UsersViewManager extends Components.DBViewManager {
  constructor({ tableConfig, fetchTableData, listContainer }) {
    super({ tableConfig, fetchTableData, listContainer });
  }

  async loadTable(sortKey = "", sortDirection = "") {
    try {
      const tableData = await this.fetchTableData(sortKey, sortDirection);

      this.listContainer.innerHTML = "";
      await this.#renderTableHeader();
      await this.#renderTableRows(tableData);
    } catch (err) {
      throw new Error(`Failed to load table: ${err.message}`);
    }
  }

  async #renderTableHeader() {
    const header = document.createElement("div");
    header.className = this.tableConfig.headerClassName;

    const numberColumn = document.createElement("span");
    numberColumn.textContent = "#";
    header.appendChild(numberColumn);

    for (const col of this.tableConfig.columns) {
      const column = document.createElement("span");
      column.textContent = col.label || "";
      header.appendChild(column);
    }

    this.listContainer.appendChild(header);
  }

  async #renderTableRows(tableData) {
    const users = tableData;

    if (!users || !Array.isArray(users)) {
      console.warn("Data is not an array:", tableData);
      return;
    }

    users.forEach((row, i) => {
      const rowEl = document.createElement("div");
      rowEl.className = this.tableConfig.entryClassName;
      rowEl.dataset.id = row.id;

      const numberColumn = document.createElement("span");
      numberColumn.className = this.tableConfig.rowNumberClassName;
      numberColumn.textContent = i + 1;
      rowEl.appendChild(numberColumn);

      this.tableConfig.columns.forEach((column) => {
        const columnEl = document.createElement("span");
        columnEl.className = column.className;

        let value = row[column.key];
        if (column.key === "is_admin") {
          value = value ? "Admin" : "User";
        }

        columnEl.textContent = value || "";
        columnEl.dataset.filterkey = column.key;
        rowEl.appendChild(columnEl);
      });

      this.tableConfig.actions.forEach((action) => {
        if (action.type === "button") {
          const button = document.createElement("button");
          button.type = "button";
          button.className = action.className || "";
          button.textContent = action.label || "";
          button.innerHTML = action.content || "";
          button.addEventListener("click", () => {
            action.callback(row);
          });

          rowEl.appendChild(button);
        } else if (action.type === "link") {
          const link = document.createElement("a");
          link.href = action.href || "";
          link.className = action.className || "";
          link.textContent = action.label || "";
          link.innerHTML = action.content || "";

          link.addEventListener("click", (e) => {
            e.preventDefault();
            action.callback(row);
          });

          rowEl.appendChild(link);
        } else {
          throw new Error(`Unknown action type: ${action.type}`);
        }
      });
      this.listContainer.appendChild(rowEl);
    });
  }
}

class UsersResultsManager extends Components.DBResultsManager {
  constructor({
    tableConfig,
    viewManager,
    sortingEnabled = false,
    sortOptions = {
      selectElement: null,
      toggleButton: null,
      defaultOption: {
        label: "Sort",
        value: "",
        disabled: true,
        selected: true,
        hidden: true,
      },
    },
    filterEnabled = false,
    filterOptions = {
      filterInputElement: null,
      filterClearBtnElement: null,
    },
  }) {
    super({
      tableConfig,
      viewManager,
      sortingEnabled,
      sortOptions,
      filterEnabled,
      filterOptions,
    });
  }

  async init() {
    const savedSortState = Components.DBStateManager.getState(
      "manage-users",
      "sort"
    );
    let sortKey = "";
    let sortDir = "";

    if (savedSortState) {
      sortKey = savedSortState.key || "";
      sortDir = savedSortState.direction || "";
    }

    if (this._getSortingEnabled()) {
      const sortKeys = this._getTableConfig()?.sortKeys || [];

      this._setSortManager(
        new Components.DBViewSortSelectManager({
          selectElement: this._getSortOptions().selectElement,
          sortDirectionButton: this._getSortOptions().toggleButton,
          sortKeys,
          defaultOption: this._getSortOptions().defaultOption,
          onSelectCallback: async (key, dir) => {
            await this.loadTable(key, dir);
          },
        })
      );

      if (sortKey && this._getSortOptions().selectElement) {
        this._getSortOptions().selectElement.value = sortKey;
      }
    }

    if (this._getFilterEnabled()) {
      const filterForKeys = this._getTableConfig().filterForKeys || [];
      const filterSelector = this._getTableConfig().filterSelector || "";

      this._setFilterManager(
        new Components.DBViewFilterManager({
          filterInputElement: this._getFilterOptions().filterInputElement,
          filterSelector: `.${filterSelector}`,
          filterForKeys,
          filterClearBtnElement: this._getFilterOptions().filterClearBtnElement,
          onFilterCallback: (entry, matchFound) => {
            Components.DBPageDOMManager.toggleElementVisibility(
              entry,
              matchFound
            );
          },
        })
      );
    }

    await this.loadTable(sortKey, sortDir);
  }

  async loadTable(sortKey = "", sortDir = "") {
    if (sortKey || sortDir) {
      Components.DBStateManager.setState("manage-users", {
        storageKey: "sort",
        value: { key: sortKey, direction: sortDir },
      });
    }

    await this._getViewManager().loadTable(sortKey, sortDir);

    this._clearFilterInput();
  }
}

class UserManagerSlideout {
  async #getUserData() {
    try {
      const response = await fetch(
        `/admin/manage-users/user-data/${encodeURIComponent(this.entityId)}`,
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
        body: JSON.stringify({ userId: this.entityId }),
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
        body: JSON.stringify({ userId: this.entityId }),
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
        body: JSON.stringify({ userId: this.entityId }),
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
        body: JSON.stringify({ userId: this.entityId }),
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
        body: JSON.stringify({ newUsername, userId: this.entityId }),
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

  #scrollToTop() {
    this.slideout.scrollTop = 0;
  }

  #hintTimeout;
  static adminId = null;

  constructor() {
    this.entityId = null;
    this.entityData = null;
    this.eventListenersBound = false;

    this.handleClose = this.handleClose.bind(this);
    this.handleUsernameInput = this.handleUsernameInput.bind(this);
    this.handleApplyChanges = this.handleApplyChanges.bind(this);
    this.handleBan = this.handleBan.bind(this);
    this.handleUnban = this.handleUnban.bind(this);
    this.handlePromote = this.handlePromote.bind(this);
    this.handleDemote = this.handleDemote.bind(this);
  }

  async init(entityId) {
    try {
      await this.loadUser(entityId);

      await this.initDOMReferences();
      UserManagerSlideout.adminId = this.slideout.dataset.id;
      await this.populateSlideout();

      if (!this.eventListenersBound) await this.bindEvents();
    } catch (err) {
      console.error(`Failed to initialize UserManagerSlideout: ${err.message}`);
      throw err;
    }
  }

  async loadUser(entityId) {
    try {
      this.entityId = entityId;
      this.entityData = await this.#getUserData();
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

    // List entry fields - Updated to use generic selector
    const userEntry = document.querySelector(
      `.user-entry[data-id="${this.entityId}"]`
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
    this.usernameInput.value = this.entityData.username;
    this.emailInput.value = this.entityData.email;
    this.timestampField.textContent = this.entityData.timestamp;
    this.authField.textContent = this.entityData.authenticated_with;
    this.roleField.textContent = this.entityData.is_admin ? "Admin" : "User";
    this.bannedField.textContent = this.entityData.banned ? "True" : "False";

    // Buttons
    const isSelf = UserManagerSlideout.adminId === this.entityId;
    [this.banBtn, this.unbanBtn, this.promoteBtn, this.demoteBtn].forEach(
      (btn) => (btn.disabled = isSelf)
    );

    this.banBtn.classList.toggle("hidden", this.entityData.banned);
    this.unbanBtn.classList.toggle("hidden", !this.entityData.banned);
    this.promoteBtn.classList.toggle("hidden", this.entityData.is_admin);
    this.demoteBtn.classList.toggle("hidden", !this.entityData.is_admin);

    // Submissions section
    if (
      this.entityData.pendingSubmissions?.length ||
      this.entityData.submissions?.length
    ) {
      this.submissionsSection.classList.remove("hidden");
      this.noSubmissionsText.classList.add("hidden");

      this.pendingSubmissionsSection.innerHTML = "";
      if (this.entityData.pendingSubmissions?.length) {
        this.pendingSubmissionsTitle.classList.remove("hidden");
        this.pendingSubmissionsSection.classList.remove("hidden");

        this.entityData.pendingSubmissions.forEach(async (submission) => {
          await this.createPendingSubmissionElement(submission);
        });
      } else {
        this.pendingSubmissionsTitle.classList.add("hidden");
        this.pendingSubmissionsSection.classList.add("hidden");
      }

      this.approvedSubmissionsSection.innerHTML = "";
      if (this.entityData.submissions?.length) {
        this.approvedSubmissionsTitle.classList.remove("hidden");
        this.approvedSubmissionsSection.classList.remove("hidden");

        this.entityData.submissions.forEach(async (submission) => {
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

      this.entityData.username = response.username;
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

      this.entityData.banned = true;
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

      this.entityData.banned = false;
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

      this.entityData.is_admin = true;
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

      this.entityData.is_admin = false;
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
    document.documentElement.classList.add("scroll-lock");
    this.slideout.classList.remove("hidden");
    this.slideoutBackdrop.classList.remove("hidden");
  }

  close() {
    this.#scrollToTop();
    document.documentElement.classList.remove("scroll-lock");
    this.slideout.classList.add("hidden");
    this.slideoutBackdrop.classList.add("hidden");
    this.disableApplyChangesBtn();
    this.clearHints();
    this.clearInputErrors();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const staticDomManager = new Components.DBPageDOMManager({
    container: ".content-wrapper",
    pageContent: ".container",
    listContainer: ".users-list--container",
    filterInput: ".manage-users-filter--input",
    filterClearBtn: ".result-filter--clear",
    sortSelect: ".manage-users--sort-select",
    sortToggleBtn: ".sort-icon",
  });

  new Components.PageLoadSpinnerManager({
    container: staticDomManager.getElement("container"),
    pageContent: staticDomManager.getElement("pageContent"),
    primaryColor: "#5A7F71",
    secondaryColor: "#e3e5e4",
    spinnerStrokeSize: "0.4rem",
    spinnerSpeed: 1.5,
    loadDelay: 100,
  });

  const dbViewManager = new UsersViewManager({
    tableConfig: TABLE_CONFIG,
    fetchTableData: UserTableDataManager.fetchTableData,
    listContainer: staticDomManager.getElement("listContainer"),
  });

  const dbManager = new UsersResultsManager({
    tableConfig: TABLE_CONFIG,
    viewManager: dbViewManager,
    sortingEnabled: true,
    sortOptions: {
      selectElement: staticDomManager.getElement("sortSelect"),
      toggleButton: staticDomManager.getElement("sortToggleBtn"),
    },
    filterEnabled: true,
    filterOptions: {
      filterInputElement: staticDomManager.getElement("filterInput"),
      filterClearBtnElement: staticDomManager.getElement("filterClearBtn"),
    },
  });

  await dbManager.init();
});
