const currentPage = window.location.pathname.split("/")[1];

/* ---------------------------- Filtering results --------------------------- */
const pageFieldConfig = {
  song: ["primary", "secondary"],
  artist: ["primary", "tertiary"],
  album: ["primary"],
  synth: ["primary", "tertiary"],
};

const filterInput = document.querySelector(".entry-filter--input");
const filterClearBtn = document.querySelector(".entry-filter--clear");

const filterEntries = function (query) {
  const lowerQuery = query.trim().toLowerCase();
  const fields = pageFieldConfig[currentPage];

  document.querySelectorAll(".list-entry").forEach((entry) => {
    const matchFound = fields.some((field) => {
      const el = entry.querySelector(`.list-entry--${field}`);
      return el && el.textContent.toLowerCase().includes(lowerQuery);
    });

    entry.classList.toggle("hide", lowerQuery && !matchFound);
  });
};

filterInput.addEventListener("input", () => {
  filterEntries(filterInput.value);
});

filterClearBtn.addEventListener("click", () => {
  filterInput.value = "";
  filterEntries(filterInput.value);
});

/* ------------------------------ Playing Audio ----------------------------- */
if (currentPage === "song") {
  const btnContainers = document.querySelectorAll(
    ".preset-entry-btn-container"
  );

  btnContainers.forEach((container) => {
    const playBtn = container.querySelector(".preset-entry--play-btn");
    const stopBtn = container.querySelector(".preset-entry--play-btn-active");

    playBtn.addEventListener("click", () => {
      document.querySelectorAll(".preset--audio").forEach((otherAudio) => {
        if (!otherAudio.paused) {
          otherAudio.pause();
          otherAudio.currentTime = 0;

          const otherContainer = otherAudio
            .closest(".list-entry")
            .querySelector(".preset-entry-btn-container");
          otherContainer
            .querySelector(".preset-entry--play-btn")
            .classList.remove("hide");
          otherContainer
            .querySelector(".preset-entry--play-btn-active")
            .classList.add("hide");
        }
      });

      const audio = container
        .closest(".list-entry")
        .querySelector(".preset--audio");

      if (audio.paused) {
        audio.play();

        playBtn.classList.add("hide");
        stopBtn.classList.remove("hide");
      } else {
        audio.pause();
        audio.currentTime = 0;

        playBtn.classList.remove("hide");
        stopBtn.classList.add("hide");
      }

      audio.addEventListener("ended", () => {
        playBtn.classList.remove("hide");
        stopBtn.classList.add("hide");
      });
    });

    stopBtn.addEventListener("click", () => {
      const audio = container
        .closest(".list-entry")
        .querySelector(".preset--audio");

      audio.pause();
      audio.currentTime = 0;

      playBtn.classList.remove("hide");
      stopBtn.classList.add("hide");
    });
  });
}
