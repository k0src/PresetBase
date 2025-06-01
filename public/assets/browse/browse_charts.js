const chartTags = document.querySelectorAll(
  ".charts-tag--list, .charts-tag--grid"
);

chartTags.forEach((tag) => {
  if (tag.textContent === "1") tag.classList.add("rank--one");
  else if (tag.textContent === "2") tag.classList.add("rank--two");
  else if (tag.textContent === "3") tag.classList.add("rank--three");
  else tag.classList.add("rank--other");
});
