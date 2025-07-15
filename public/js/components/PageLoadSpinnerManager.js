export class PageLoadSpinnerManager {
  #container;
  #pageContent;
  #hiddenClass;
  #spinnerStyle;
  #primaryColor;
  #secondaryColor;
  #spinnerWidth;
  #spinnerHeight;
  #spinnerStrokeSize;
  #spinnerSpeed;
  #className;
  #loadDelay;
  #onLoadCallback;
  #spinner;

  static #spinnerStyles = {
    default: {
      classStyles: {
        width: "var(--spinner-width)",
        height: "var(--spinner-height)",
        border: "var(--spinner-stroke-size) solid var(--spinner-primary-color)",
        borderBottomColor: "var(--spinner-secondary-color)",
        borderRadius: "50%",
        boxSizing: "border-box",
        animation: "var(--spinner-animation)",
      },
      keyframesName: "page-spinner-rotate",
      keyframes: `
      @keyframes page-spinner-rotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `,
    },
  };

  constructor(options) {
    const {
      container,
      pageContent,
      hiddenClass = "hidden",
      spinnerStyle = "default",
      primaryColor = "#ffffff",
      secondaryColor = "#000000",
      spinnerWidth = "4.8rem",
      spinnerHeight = "4.8rem",
      spinnerStrokeSize = "0.4rem",
      spinnerSpeed = 2,
      className = "page-load-spinner",
      loadDelay = 0,
      onLoadCallback = null,
    } = options;

    if (!(container instanceof HTMLElement)) {
      throw new Error("Container must be an HTMLElement.");
    }

    if (!(pageContent instanceof HTMLElement)) {
      throw new Error("Page Content must be an HTMLElement.");
    }

    this.#container = container;
    this.#pageContent = pageContent;
    this.#hiddenClass = hiddenClass;
    this.#spinnerStyle = spinnerStyle;
    this.#primaryColor = primaryColor;
    this.#secondaryColor = secondaryColor;
    this.#spinnerSpeed = spinnerSpeed;
    this.#spinnerWidth = spinnerWidth;
    this.#spinnerHeight = spinnerHeight;
    this.#spinnerStrokeSize = spinnerStrokeSize;
    this.#className = className;
    this.#loadDelay = loadDelay;
    this.#onLoadCallback = onLoadCallback;

    this.#initSpinner();
  }

  #initSpinner() {
    this.#injectSpinnerAnimation();
    this.#renderSpinner();
    this.#bindEvents();
  }

  #injectSpinnerAnimation() {
    const styleDef = PageLoadSpinnerManager.#spinnerStyles[this.#spinnerStyle];
    if (!styleDef?.keyframes || !styleDef?.keyframesName) return;

    const id = `page-spinner-style-${styleDef.keyframesName}`;
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = styleDef.keyframes;
    document.head.appendChild(style);
  }

  #renderSpinner() {
    const styleTemplate =
      PageLoadSpinnerManager.#spinnerStyles[this.#spinnerStyle];
    if (!styleTemplate) {
      throw new Error(`Invalid spinner style: '${this.#spinnerStyle}'`);
    }

    this.#spinner = document.createElement("div");
    this.#spinner.className = this.#className;

    this.#spinner.style.setProperty("--spinner-width", this.#spinnerWidth);
    this.#spinner.style.setProperty("--spinner-height", this.#spinnerHeight);
    this.#spinner.style.setProperty(
      "--spinner-primary-color",
      this.#primaryColor
    );
    this.#spinner.style.setProperty(
      "--spinner-secondary-color",
      this.#secondaryColor
    );
    this.#spinner.style.setProperty(
      "--spinner-stroke-size",
      this.#spinnerStrokeSize
    );
    this.#spinner.style.setProperty(
      "--spinner-animation",
      `${styleTemplate.keyframesName} ${this.#spinnerSpeed}s linear infinite`
    );

    Object.entries(styleTemplate.classStyles).forEach(([prop, value]) => {
      this.#spinner.style[prop] = value;
    });

    this.#pageContent.classList.add(this.#hiddenClass);
    this.#container.appendChild(this.#spinner);
  }

  #hideSpinner() {
    if (this.#spinner) {
      this.#spinner.remove();
      this.#spinner = null;
    }
    this.#pageContent.classList.remove(this.#hiddenClass);
  }

  #handleWindowLoad() {
    if (this.#loadDelay > 0) {
      setTimeout(() => {
        this.#hideSpinner();
        this.#onLoadCallback?.();
      }, this.#loadDelay);
    } else {
      this.#hideSpinner();
      this.#onLoadCallback?.();
    }
  }

  #bindEvents() {
    window.addEventListener("load", this.#handleWindowLoad.bind(this));
  }
}
