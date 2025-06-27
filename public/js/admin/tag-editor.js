document.addEventListener("DOMContentLoaded", () => {
  const defaultColors = {
    textColor: "#ff5a9c",
    borderColor: "#51152b",
    backgroundColor: "#3a0a1e",
  };

  const demoTag = document.querySelector(".tag-demo");
  const colorInputs = document.querySelectorAll(".coloris");
  const nameInput = document.querySelector(".name-input");
  const slugInput = document.querySelector(".slug-input");
  const resetButton = document.querySelector(".clear-btn");

  const setDemoTagColors = (textColor, borderColor, backgroundColor) => {
    demoTag.style.color = textColor;
    demoTag.style.borderColor = borderColor;
    demoTag.style.backgroundColor = backgroundColor;
  };

  const updateDemoTagFromInputs = () => {
    setDemoTagColors(
      document.querySelector(".coloris.instance1").value,
      document.querySelector(".coloris.instance2").value,
      document.querySelector(".coloris.instance3").value
    );
  };

  const resetColorInputs = () => {
    colorInputs.forEach((input) => {
      const key = input.dataset.key;

      switch (key) {
        case "color":
          input.value = defaultColors.textColor;
          break;
        case "border-color":
          input.value = defaultColors.borderColor;
          break;
        case "background-color":
          input.value = defaultColors.backgroundColor;
          break;
      }

      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };

  /* ----------------------------- Initialization ----------------------------- */
  const initColorPicker = () => {
    Coloris({
      el: ".coloris",
      themeMode: "dark",
      format: "hex",
      alpha: false,
      focusInput: true,
    });

    Coloris.setInstance(".instance1", {
      defaultColor: defaultColors.textColor,
    });
    Coloris.setInstance(".instance2", {
      defaultColor: defaultColors.borderColor,
    });
    Coloris.setInstance(".instance3", {
      defaultColor: defaultColors.backgroundColor,
    });
  };

  const bindColorInputEvents = () => {
    colorInputs.forEach((input) => {
      input.addEventListener("input", () => {
        demoTag.style.setProperty(input.dataset.key, input.value);
      });
    });
  };

  const bindNameInputEvents = () => {
    nameInput.addEventListener("input", () => {
      const nameVal = nameInput.value;
      demoTag.textContent = nameVal || "Tag Name";
      slugInput.value = nameVal.toLowerCase().replace(/\s+/g, "-");
    });
  };

  const bindResetButton = () => {
    if (!resetButton) return;
    resetButton.addEventListener("click", () => {
      setDemoTagColors(
        defaultColors.textColor,
        defaultColors.borderColor,
        defaultColors.backgroundColor
      );
      resetColorInputs();
    });
  };

  initColorPicker();
  bindColorInputEvents();
  bindNameInputEvents();
  bindResetButton();
  updateDemoTagFromInputs();
  validateForm();
});

/* ----------------------------- Form validation ---------------------------- */
const validateForm = function () {
  const form = document.getElementById("tag-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const slug = document.querySelector(".slug-input").value.trim();
    const name = document.querySelector(".name-input").value.trim();

    const url = `/api/checktags?name=${encodeURIComponent(
      name
    )}&slug=${encodeURIComponent(slug)}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.error("Failed to check tag existence:", response.statusText);
        return;
      }

      const data = await response.json();

      if (data.tag_exists) {
        alert("Duplicate tag exists. Please choose a different name or slug.");
        return;
      }

      form.submit();
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  });
};
