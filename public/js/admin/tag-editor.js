/* --------------------------- Color Picker Config -------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  Coloris({
    el: ".coloris",
    themeMode: "dark",
    format: "hex",
    alpha: false,
    focusInput: true,
  });

  Coloris.setInstance(".instance1", { defaultColor: "#ff5a9c" });
  Coloris.setInstance(".instance2", { defaultColor: "#51152b" });
  Coloris.setInstance(".instance2", { defaultColor: "#3a0a1e" });

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
});
