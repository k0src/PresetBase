const hoverBoxes = document.querySelectorAll(".hover-box");

let isHovering = false;

hoverBoxes.forEach((box) => {
  const tooltip = box.querySelector(".submission-img");

  box.addEventListener("mouseenter", () => {
    isHovering = true;
    tooltip.style.opacity = 1;
  });

  box.addEventListener("mouseleave", () => {
    isHovering = false;

    setTimeout(() => {
      if (!isHovering) tooltip.style.opacity = 0;
    }, 100);
  });

  box.addEventListener("mousemove", (e) => {
    const boxRect = box.getBoundingClientRect();

    const offsetX = e.clientX - boxRect.left;
    const offsetY = e.clientY - boxRect.top;

    tooltip.style.transform = `translate(${offsetX + 10}px, ${offsetY + 10}px)`;
  });
});
