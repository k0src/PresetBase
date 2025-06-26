/* --------------------------- Color Picker Config -------------------------- */
const defaultColors = {
  textColor: "#ff5a9c",
  borderColor: "#51152b",
  backgroundColor: "#3a0a1e",
};

document.addEventListener("DOMContentLoaded", () => {
  // Color picker
  Coloris({
    el: ".coloris",
    themeMode: "dark",
    format: "hex",
    alpha: false,
    focusInput: true,
  });

  Coloris.setInstance(".instance1", { defaultColor: defaultColors.textColor });
  Coloris.setInstance(".instance2", {
    defaultColor: defaultColors.borderColor,
  });
  Coloris.setInstance(".instance2", {
    defaultColor: defaultColors.backgroundColor,
  });

  // Change tag colors and text
  const colorInputs = document.querySelectorAll(".coloris");
  const demoTag = document.querySelector(".tag-demo");

  colorInputs.forEach((colorInput) => {
    colorInput.addEventListener("input", () => {
      demoTag.style.setProperty(colorInput.dataset.key, colorInput.value);
    });
  });

  const nameInput = document.querySelector(".name-input");

  nameInput.addEventListener("input", () => {
    demoTag.textContent = nameInput.value || "Tag Name";
  });

  // Reset fields and tag with reset button
  const resetButton = document.querySelector(".clear-btn");

  resetButton.addEventListener("click", () => {
    // Tag
    demoTag.textContent = "Tag Name";
    demoTag.style.setProperty("color", defaultColors.textColor);
    demoTag.style.setProperty("border-color", defaultColors.borderColor);
    demoTag.style.setProperty(
      "background-color",
      defaultColors.backgroundColor
    );

    // Fields
    colorInputs.forEach((input) => {
      const key = input.dataset.key;

      console.log(input.value, defaultColors.textColor);

      if (key === "color") input.value = defaultColors.textColor;
      else if (key === "border-color") input.value = defaultColors.borderColor;
      else if (key === "background-color")
        input.value = defaultColors.backgroundColor;

      // Trigger input event to refresh thumbnail
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });
});
