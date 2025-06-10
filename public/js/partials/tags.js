const tags = document.querySelectorAll(".--tag, .--tag--small");

if (tags.length !== 0) {
  tags.forEach((tag) => {
    tag.classList.add(
      `tag--${tag.textContent.trim().toLowerCase().replaceAll(" ", "-")}`
    );
  });
}
