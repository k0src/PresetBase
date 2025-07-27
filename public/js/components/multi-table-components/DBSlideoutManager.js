import { ValidateOptions } from "../ValidateOptions.js";
import { EventBinder } from "../EventBinder.js";
import { AutofillDropdownManager } from "../AutofillDropdownManager.js";

export class DBSlideoutManager {
  #hintTimeout;
  #eventBinder;
  #validator;
  #elements;
  #components;
  #config;
  #onSaveCallback;
  #onDeleteCallback;

  constructor(options = {}) {
    this.#validator = new ValidateOptions();
    this.#eventBinder = new EventBinder();
    this.#elements = {};
    this.#components = [];
    this.#config = {
      entryType: null,
      entryId: null,
      entryData: null,
      apiEndpoint: null,
      ...options,
    };

    this.#onSaveCallback = options.onSaveCallback || null;
    this.#onDeleteCallback = options.onDeleteCallback || null;

    this.#initStaticDOM();
    this.#bindGlobalEvents();
  }

  setTitle(title) {
    this.#elements.titleEl.textContent = title;
    return this;
  }

  setConfig(config) {
    this.#config = { ...this.#config, ...config };
    return this;
  }

  setEntryData(entryType, entryId, entryData) {
    this.#config.entryType = entryType;
    this.#config.entryId = entryId;
    this.#config.entryData = entryData;
    return this;
  }

  setApiEndpoint(endpoint) {
    this.#config.apiEndpoint = endpoint;
    return this;
  }

  setCallbacks({ onSave, onDelete }) {
    if (onSave) this.#onSaveCallback = onSave;
    if (onDelete) this.#onDeleteCallback = onDelete;
    return this;
  }

  addTopInfo(fields) {
    this.#renderTopInfo(fields);
    return this;
  }

  addInput(options) {
    const { key, label, placeholder, type = "text", value = "" } = options;

    const labelEl = document.createElement("span");
    labelEl.className = "slideout-entry-info-text";
    labelEl.textContent = label;

    const input = document.createElement("input");
    input.className = "slideout-entry-info-input";
    input.type = type;
    input.placeholder = placeholder;
    input.name = key;
    input.value = value;

    this.#elements.inputContainer.append(labelEl, input);
    this.#components.push({ type: "input", element: input, config: options });

    return this;
  }

  addFileUpload(options) {
    const { key, label, type, value = "" } = options;

    if (type === "image") {
      const labelEl = document.createElement("span");
      labelEl.className = "slideout-entry-info-text";
      labelEl.textContent = label;

      const container = document.createElement("div");
      container.className = "slideout-img-container";

      const img = document.createElement("img");
      img.className = "slideout-img";
      img.alt = `${this.#config.entryType} image`;
      img.src = value
        ? `/uploads/images/approved/${value}`
        : "/assets/images/image-upload-placeholder.webp";

      const wrapper = document.createElement("div");
      wrapper.className = "slideout-file-input-wrapper";
      wrapper.innerHTML = `
        <div class="slideout-custom-file-input">
          <button type="button" class="slideout-browse-button">Browse...</button>
          <span class="slideout-file-name">
            ${value || "No file selected"}
          </span>
          <input 
            type="file" 
            class="slideout-img-input" 
            accept="image/*" 
            name="${key}" 
          />
        </div>`;

      container.append(img, wrapper);
      this.#elements.inputContainer.append(labelEl, container);

      this.#components.push({
        type: "fileUpload",
        element: wrapper,
        config: options,
      });
    }

    return this;
  }

  addDropdownSelector(options) {
    const {
      key,
      label,
      placeholder,
      dataFields,
      apiFunction,
      value = {},
    } = options;

    const labelEl = document.createElement("span");
    labelEl.className = "slideout-entry-info-text";
    labelEl.textContent = label;

    const container = document.createElement("div");
    container.className = "slideout-selector-container";

    const textContainer = document.createElement("div");
    textContainer.className = "slideout-selector-text-container";

    const primary = value[dataFields[0]] || "None";
    const secondary = value[dataFields[1]] || "None";

    const text = document.createElement("span");
    text.className = "slideout-selector-text";
    text.setAttribute("data-id", secondary);
    text.textContent = primary;

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-caret-down slideout-selector-icon";

    textContainer.append(text, icon);

    const dropdownContainer = document.createElement("div");
    dropdownContainer.className = "slideout-dropdown-container hidden";

    const input = document.createElement("input");
    input.className = "slideout-selector-filter-input";
    input.type = "text";
    input.placeholder = placeholder;
    input.name = key;

    const ul = document.createElement("ul");
    ul.className = "slideout-dropdown hidden";
    ul.id = `slideout-dropdown-${key}`;

    new AutofillDropdownManager({
      table: key,
      inputElement: input,
      dropdownElement: ul,
      resultsLimit: 7,
      shouldAutofillInput: false,
      onSelectCallback: ({ label, id }) => {
        text.textContent = label;
        text.setAttribute("data-id", id);
        this.#toggleDropdownContainer(textContainer, dropdownContainer);
        this.#enableApplyBtn();
      },
      fetchResults: apiFunction,
      hideDropdownOnClickOff: false,
    });

    textContainer.addEventListener("click", () => {
      input.value = "";
      input.dispatchEvent(new Event("input"));
      this.#toggleDropdownContainer(textContainer, dropdownContainer);
      input.focus();
    });

    const addWrap = document.createElement("div");
    addWrap.className = "slideout-dropdown-add-container";

    const addBtn = document.createElement("button");
    addBtn.className = "hidden-btn slideout-dropdown-add-btn";
    addBtn.innerHTML = `<i class="fa-solid fa-plus slideout-add-icon"></i>`;
    addBtn.addEventListener("click", () => {
      window.location.href = `/admin/manage-db/${key}`;
    });

    addWrap.appendChild(addBtn);
    const divider = document.createElement("div");
    divider.className = "slideout-dropdown-divider";

    dropdownContainer.append(input, ul, divider, addWrap);
    container.append(textContainer, dropdownContainer);

    this.#elements.inputContainer.append(labelEl, container);
    this.#components.push({
      type: "dropdownSelector",
      element: container,
      config: options,
    });

    return this;
  }

  addList(options) {
    const {
      key,
      label,
      placeholder,
      dataFields,
      apiFunction,
      items = [],
    } = options;

    const labelEl = document.createElement("span");
    labelEl.className = "slideout-entry-info-text";
    labelEl.textContent = label;

    const listWrapper = document.createElement("div");
    listWrapper.className = "slideout-list-wrapper";

    const listContainer = document.createElement("div");
    listContainer.className = "slideout-list-container";

    const {
      id: idField,
      primary: primaryField,
      secondary: secondaryField,
      numColumns,
    } = dataFields;

    items.forEach((item) => {
      const id = item[idField];
      const primary = item[primaryField];
      const secondary = item[secondaryField];
      const entry = this.#createListEntry(
        primary,
        secondary,
        id,
        this.#normalizeText(secondaryField),
        numColumns
      );
      listContainer.appendChild(entry);
    });

    const addBtnWrap = document.createElement("div");
    addBtnWrap.className = "slideout-list-add-container";

    const addBtn = document.createElement("button");
    addBtn.className = "hidden-btn slideout-list-add-btn";
    addBtn.innerHTML = `<i class="fa-solid fa-plus slideout-add-icon"></i>`;

    const dropdown = document.createElement("div");
    dropdown.className = "slideout-dropdown-container hidden";

    const input = document.createElement("input");
    input.className = "slideout-list-filter-input";
    input.type = "text";
    input.placeholder = placeholder;
    input.name = key;

    const ul = document.createElement("ul");
    ul.className = "slideout-dropdown hidden";
    ul.id = `slideout-dropdown-${key}`;

    addBtn.addEventListener("click", () => {
      input.value = "";
      input.dispatchEvent(new Event("input"));
      this.#toggleDropdownContainer(listContainer, dropdown);
      input.focus();
    });

    new AutofillDropdownManager({
      table: key,
      inputElement: input,
      dropdownElement: ul,
      resultsLimit: 7,
      shouldAutofillInput: false,
      onSelectCallback: ({ label, id }) => {
        const newEntry = this.#createListEntry(
          label,
          "",
          id,
          this.#normalizeText(secondaryField),
          numColumns
        );
        listContainer.insertBefore(newEntry, addBtnWrap);
        this.#toggleDropdownContainer(listContainer, dropdown);
        if (numColumns === 1) this.#enableApplyBtn();
      },
      fetchResults: apiFunction,
      hideDropdownOnClickOff: false,
    });

    addBtnWrap.appendChild(addBtn);
    dropdown.append(input, ul);
    listContainer.appendChild(addBtnWrap);
    listWrapper.appendChild(listContainer);
    listWrapper.appendChild(dropdown);

    this.#elements.inputContainer.append(labelEl, listWrapper);
    this.#components.push({
      type: "list",
      element: listWrapper,
      config: options,
    });

    return this;
  }

  addButton(options) {
    const { text, onClick, className = "", disabled = false } = options;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = className;
    btn.disabled = disabled;
    btn.textContent = text;

    if (onClick) {
      btn.addEventListener("click", onClick);
    }

    this.#elements.inputContainer.appendChild(btn);
    this.#components.push({ type: "button", element: btn, config: options });

    return this;
  }

  addApplyButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slideout-apply-changes-btn";
    btn.disabled = true;
    btn.textContent = "Apply Changes";

    const hint = document.createElement("div");
    hint.className = "slideout-hint hidden";

    this.#elements.inputContainer.append(btn, hint);
    this.#elements.applyBtn = btn;
    this.#elements.hint = hint;

    this.#eventBinder.bind(btn, "click", this.#handleApplyChanges.bind(this));

    return this;
  }

  addDeleteButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slideout-delete-btn";
    btn.textContent = `Delete ${this.#config.label || "Entry"}`;

    this.#elements.actionBtns.appendChild(btn);
    this.#elements.deleteBtn = btn;

    this.#eventBinder.bind(btn, "click", this.#handleDelete.bind(this));

    return this;
  }

  show() {
    document.documentElement.classList.add("scroll-lock");
    this.#elements.slideout.classList.remove("hidden");
    this.#elements.backdrop.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    this.#bindDynamicEvents();
    return this;
  }

  close() {
    this.#scrollToTop();
    document.documentElement.classList.remove("scroll-lock");
    this.#elements.slideout.classList.add("hidden");
    this.#elements.backdrop.classList.add("hidden");
    this.#disableApplyBtn();
    this.#clearHint();
    this.#clearInputErrors();
    this.destroy();
    return this;
  }

  destroy() {
    this.#eventBinder.unbindAll();
    this.#clearHint();
    this.#clearInputErrors();
    this.#config.entryId = null;
    this.#config.entryData = null;
    this.#elements.topContainer.innerHTML = "";
    this.#elements.inputContainer.innerHTML = "";
    this.#elements.actionBtns.innerHTML = "";
    this.#components = [];
  }

  #initStaticDOM() {
    const $ = (sel) => document.getElementById(sel);

    this.#elements = {
      slideout: $("slideout-panel"),
      backdrop: $("slideout-backdrop"),
      titleEl: $("slideout-title"),
      closeBtn: $("slideout-close-btn"),
      content: $("slideout-content"),
      topContainer: $("slideout-entry-info-top-container"),
      inputContainer: $("slideout-entry-info-input-container"),
      actions: $("slideout-actions"),
      actionBtns: $("slideout-actions-btns"),
    };
  }

  #bindGlobalEvents() {
    this.#eventBinder.bind(
      this.#elements.closeBtn,
      "click",
      this.#handleClose.bind(this)
    );
    this.#eventBinder.bind(
      this.#elements.backdrop,
      "click",
      this.#handleClose.bind(this)
    );

    this.#eventBinder.bind(document, "keydown", (e) => {
      if (e.key === "Escape") {
        this.#closeAllDropdownContainers();
        this.close();
      }
    });

    this.#eventBinder.bind(this.#elements.slideout, "click", (event) => {
      const dropdownSelectors = this.#elements.content.querySelectorAll(
        ".slideout-selector-container"
      );
      const dropdownContainers = this.#elements.content.querySelectorAll(
        ".slideout-dropdown-container"
      );
      const addBtns = this.#elements.content.querySelectorAll(
        ".slideout-list-add-btn, .slideout-selector-add-btn"
      );

      const ignore = [...dropdownSelectors, ...dropdownContainers, ...addBtns];
      if (!ignore.some((el) => el.contains(event.target))) {
        this.#closeAllDropdownContainers();
      }
    });
  }

  #bindDynamicEvents() {
    const inputs = this.#elements.content.querySelectorAll(
      ".slideout-entry-info-input, .slideout-list-entry-input"
    );
    inputs.forEach((input) => {
      this.#eventBinder.bind(input, "input", this.#handleInput.bind(this));
    });

    this.#handleImgInputs();
  }

  #renderTopInfo(fields) {
    this.#elements.topContainer.innerHTML = "";

    fields.forEach((field, i) => {
      const wrapper = document.createElement("div");
      wrapper.className = "slideout-entry-info-top-entry";

      if (field.type === "link") {
        const link = document.createElement("a");
        link.className = "slideout-entry-info-top-link";
        link.href = `${field.href}${this.#config.entryData[field.key]}`;
        link.textContent = field.label;

        const icon = document.createElement("i");
        icon.className =
          "fa-solid fa-arrow-up-right-from-square slideout-entry-info-open-icon";

        wrapper.append(link, icon);
      } else {
        const label = document.createElement("span");
        label.className = "slideout-entry-info-top-text";
        label.innerHTML = `<strong>${field.label}</strong>`;

        const value = document.createElement("span");
        value.className = "slideout-entry-info-top-text";
        value.textContent = this.#config.entryData[field.key];

        wrapper.append(label, value);
      }

      this.#elements.topContainer.appendChild(wrapper);

      if (i < fields.length - 1) {
        const bullet = document.createElement("div");
        bullet.className = "slideout-entry-info-top-entry";
        bullet.innerHTML = `
          <span class="slideout-entry-info-top-text">
            <strong>&bull;</strong>
          </span>`;
        this.#elements.topContainer.appendChild(bullet);
      }
    });
  }

  #createListEntry(primary, secondary, id, secondaryPlaceholder, numColumns) {
    const entry = document.createElement("div");
    entry.className = `slideout-list-entry--${numColumns}`;
    entry.id = `slideout-list-entry-${id}`;

    const primaryWrapper = document.createElement("div");
    primaryWrapper.className = "slideout-list-entry-text-wrapper";
    const primaryText = document.createElement("span");
    primaryText.className = "slideout-list-entry-text";
    primaryText.textContent = primary;
    primaryWrapper.appendChild(primaryText);

    let secondaryWrapper = null;
    let secondaryInput = null;

    if (numColumns > 1) {
      secondaryWrapper = document.createElement("div");
      secondaryWrapper.className = "slideout-list-entry-text-wrapper";
      secondaryInput = document.createElement("input");
      secondaryInput.className = "slideout-list-entry-input";
      secondaryInput.type = "text";
      secondaryInput.value = secondary;
      secondaryInput.placeholder = secondaryPlaceholder;
      secondaryInput.addEventListener("input", this.#handleInput.bind(this));
      secondaryWrapper.appendChild(secondaryInput);
    }

    const removeBtn = document.createElement("button");
    removeBtn.className = "hidden-btn slideout-list-remove-btn";
    removeBtn.innerHTML = `<i class="fa-solid fa-xmark slideout-remove-icon"></i>`;
    removeBtn.addEventListener("click", () => {
      entry.remove();
      this.#enableApplyBtn();
    });

    entry.append(primaryWrapper);
    if (secondaryWrapper) entry.append(secondaryWrapper);
    entry.append(removeBtn);
    return entry;
  }

  #showHint(msg, type) {
    this.#clearHint();
    if (this.#elements.hint) {
      this.#elements.hint.classList.remove("hidden");
      this.#elements.hint.textContent = msg;
      this.#elements.hint.classList.add(
        type === "success" ? "slideout-hint--success" : "slideout-hint--error"
      );

      if (this.#hintTimeout) clearTimeout(this.#hintTimeout);
      this.#hintTimeout = setTimeout(() => this.#clearHint(), 5000);
    }
  }

  #clearHint() {
    if (this.#elements.hint) {
      this.#elements.hint.classList.add("hidden");
      this.#elements.hint.textContent = "";
      this.#elements.hint.classList.remove(
        "slideout-hint--error",
        "slideout-hint--success"
      );
    }
  }

  #clearInputErrors() {
    const inputs = this.#elements.content.querySelectorAll(
      ".slideout-entry-info-input, .slideout-list-entry-input"
    );
    inputs.forEach((input) => input.classList.remove("slideout-input--error"));
  }

  #disableApplyBtn() {
    if (this.#elements.applyBtn) this.#elements.applyBtn.disabled = true;
  }

  #enableApplyBtn() {
    if (this.#elements.applyBtn) this.#elements.applyBtn.disabled = false;
  }

  #normalizeText(str) {
    return str
      ? str
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "";
  }

  #validateListsHaveItems() {
    const listContainers = this.#elements.content.querySelectorAll(
      ".slideout-list-container"
    );

    for (const container of listContainers) {
      const entries = container.querySelectorAll(
        ".slideout-list-entry--1, .slideout-list-entry--2"
      );
      if (entries.length === 0) return false;
    }

    return true;
  }

  #handleImgInputs() {
    const dispatchInputEvent = () => {
      const inputs = this.#elements.content.querySelectorAll(
        ".slideout-entry-info-input, .slideout-list-entry-input"
      );
      inputs.forEach((input) => {
        input.dispatchEvent(new Event("input"));
      });
    };

    const imageInputs = this.#elements.content.querySelectorAll(
      ".slideout-img-input"
    );
    imageInputs.forEach((imageInput) => {
      imageInput.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onerror = function () {
          alert("Invalid image file.");
        };

        img.onload = () => {
          if (img.width < 1000 || img.height < 1000) {
            alert("Image must be at least 1000x1000 pixels.");
          } else {
            const fileNameDisplay = imageInput
              .closest(".slideout-custom-file-input")
              .querySelector(".slideout-file-name");

            fileNameDisplay.textContent = file.name;

            const imgDisplay = imageInput
              .closest(".slideout-img-container")
              .querySelector(".slideout-img");

            imgDisplay.onload = function () {
              URL.revokeObjectURL(img.src);
            };

            imgDisplay.src = img.src;

            dispatchInputEvent();
          }
        };
      });
    });
  }

  #scrollToTop() {
    this.#elements.slideout.scrollTop = 0;
  }

  #closeAllDropdownContainers() {
    const dropdownSelectors = this.#elements.content.querySelectorAll(
      ".slideout-selector-container"
    );
    const dropdownContainers = this.#elements.content.querySelectorAll(
      ".slideout-dropdown-container"
    );

    dropdownSelectors.forEach((btn) => btn.classList.remove("show"));
    dropdownContainers.forEach((c) => c.classList.add("hidden"));
  }

  #toggleDropdownContainer(btn, container) {
    btn.classList.toggle("show");
    container.classList.toggle("hidden");
  }

  #handleInput() {
    const inputs = this.#elements.content.querySelectorAll(
      ".slideout-entry-info-input, .slideout-list-entry-input"
    );

    const inputsFilled = [...inputs].every((i) => i.value.trim().length > 0);
    const listsValid = this.#validateListsHaveItems();

    if (this.#elements.applyBtn) {
      this.#elements.applyBtn.disabled = !(inputsFilled && listsValid);
    }
  }

  #getInputValues() {
    const formData = new FormData();
    formData.append("id", this.#config.entryId);

    const inputs = this.#elements.content.querySelectorAll(
      ".slideout-entry-info-input"
    );
    inputs.forEach((input) => {
      if (!input.classList.contains("slideout-list-entry-input")) {
        formData.append(input.name, input.value.trim());
      }
    });

    const dropdownSelectors = this.#elements.content.querySelectorAll(
      ".slideout-selector-container"
    );
    dropdownSelectors.forEach((selector) => {
      const key = selector.querySelector(
        ".slideout-selector-filter-input"
      ).name;
      const id = selector
        .querySelector(".slideout-selector-text")
        .getAttribute("data-id");
      formData.append(key, id ? parseInt(id) : "");
    });

    const listComponents = this.#components.filter((c) => c.type === "list");
    listComponents.forEach((listComponent) => {
      const list = listComponent.config;
      const container = this.#elements.content
        .querySelector(`#slideout-dropdown-${list.key}`)
        ?.closest(".slideout-list-wrapper");
      if (!container) return;

      const numColumns = list.dataFields.numColumns;
      const entries = container.querySelectorAll(
        `.slideout-list-entry--${numColumns}`
      );
      const result = [];

      entries.forEach((entry) => {
        const id = parseInt(entry.id.replace("slideout-list-entry-", ""));
        if (numColumns === 1) {
          result.push(id);
        } else {
          const value = entry
            .querySelector(".slideout-list-entry-input")
            .value.trim();
          result.push({
            [list.dataFields.id]: id,
            [list.dataFields.secondary]: value,
          });
        }
      });

      formData.append(list.key, JSON.stringify(result));
    });

    const imageInputs = this.#elements.content.querySelectorAll(
      ".slideout-img-input"
    );
    imageInputs.forEach((input) => {
      if (input.files.length > 0) {
        formData.append(input.name, input.files[0]);
      }
    });

    return formData;
  }

  async #updateEntry(apiEndpoint, formData) {
    try {
      const response = await fetch(apiEndpoint, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return await response.json();
    } catch (err) {
      throw new Error(`Failed to update entry: ${err.message}`);
    }
  }

  async #handleApplyChanges() {
    const formData = this.#getInputValues();
    const apiEndpoint = this.#config.apiEndpoint;

    try {
      const response = await this.#updateEntry(apiEndpoint, formData);

      if (!response) {
        this.#showHint("No response from server.", "error");
        return;
      }

      this.#showHint("Changes saved successfully.", "success");
      this.#onSaveCallback?.();
      this.#disableApplyBtn();
    } catch (err) {
      console.error(err);
      this.#showHint("Failed to save changes.", "error");
    }
  }

  async #handleClose() {
    this.close();
  }

  async #handleDelete() {
    const confirmed = confirm(
      `Are you sure you want to delete this ${this.#config.label || "entry"}?`
    );

    if (!confirmed) return;

    const apiEndpoint = this.#config.apiEndpoint;
    try {
      const response = await fetch(`${apiEndpoint}${this.#config.entryId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      this.#onDeleteCallback?.();
      this.close();
    } catch (err) {
      console.error(err);
      this.#showHint("Failed to delete entry.", "error");
    }
  }

  static async createFromConfig(
    slideoutConfig,
    entryType,
    entryId,
    onSaveCallback
  ) {
    const config = slideoutConfig[entryType];

    const response = await fetch(`${config.apiEndpoint}${entryId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error((await response.json()).error);
    }

    const entryData = await response.json();

    const slideout = new DBSlideoutManager({
      onSaveCallback,
      label: config.label,
    });

    slideout
      .setTitle(config.title)
      .setConfig({
        entryType,
        entryId,
        entryData,
        apiEndpoint: config.apiEndpoint,
        label: config.label,
      })
      .addTopInfo(config.fields);

    config.inputs.forEach((input) => {
      slideout.addInput({
        ...input,
        value: entryData[input.key],
      });
    });

    if (config.fileUploads) {
      config.fileUploads.forEach((upload) => {
        slideout.addFileUpload({
          ...upload,
          value: entryData[upload.key],
        });
      });
    }

    if (config.dropdownSelectors) {
      config.dropdownSelectors.forEach((dropdown) => {
        slideout.addDropdownSelector({
          ...dropdown,
          value: entryData[dropdown.key],
        });
      });
    }

    if (config.lists) {
      config.lists.forEach((list) => {
        slideout.addList({
          ...list,
          items: entryData[list.key] || [],
        });
      });
    }

    slideout.addApplyButton().addDeleteButton();

    return slideout;
  }
}
