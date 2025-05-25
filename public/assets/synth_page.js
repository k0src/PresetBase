const openSongContainers = document.querySelectorAll(".open-song-container");
const presetResultCards = document.querySelectorAll(".preset-result-card");
const presetAudioPlayBtns = document.querySelectorAll(".preset-audio-play");
const songResultCards = document.querySelectorAll(".result-card");

songResultCards.forEach((element) => {
  element.addEventListener("click", () => {
    const presetSection = element.nextElementSibling;
    const expandBtn = element.querySelector(".expand-icon");

    expandBtn.classList.toggle("expand-icon--active");

    if (presetSection) {
      presetSection.style.maxHeight =
        getComputedStyle(presetSection).maxHeight === "0px"
          ? presetSection.scrollHeight + "px"
          : "0px";
    }
  });
});

openSongContainers.forEach((element) => {
  element.addEventListener("mouseover", () => {
    const coverImg = element.querySelector(".result-img");
    const openIcon = element.querySelector(".open-song-overlay-icon");

    coverImg.classList.add("result-img--active");
    openIcon.classList.add("open-song-overlay-icon--active");
  });
});

openSongContainers.forEach((element) => {
  element.addEventListener("mouseout", () => {
    const coverImg = element.querySelector(".result-img");
    const openIcon = element.querySelector(".open-song-overlay-icon");

    coverImg.classList.remove("result-img--active");
    openIcon.classList.remove("open-song-overlay-icon--active");
  });
});

openSongContainers.forEach((element) => {
  element.addEventListener("click", () => {
    const songId = JSON.parse(decodeURIComponent(element.dataset.songId));
    window.location.href = `/song/${songId}`;
  });
});

presetResultCards.forEach((element) => {
  element.addEventListener("click", () => {
    const playBtn = element.querySelector(".preset-audio-play");
    presetAudioPlayBtns.forEach((btn) => {
      if (btn !== playBtn) {
        const otherPresetResultCard = btn.closest(".preset-result-card");
        const otherAudio =
          otherPresetResultCard.querySelector(".preset--audio");

        otherPresetResultCard.classList.remove("preset-result-card--active");
        btn.textContent = "play_circle";
        btn.classList.remove("preset-audio-play--active");

        if (!otherAudio.paused) {
          otherAudio.pause();
          otherAudio.currentTime = 0;
        }
      }
    });

    const audio = element.querySelector(".preset--audio");

    element.classList.toggle("preset-result-card--active");
    playBtn.classList.toggle("preset-audio-play--active");
    playBtn.textContent =
      playBtn.textContent === "play_circle" ? "stop_circle" : "play_circle";

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
      audio.currentTime = 0;
    }

    audio.addEventListener("ended", () => {
      playBtn.textContent = "play_circle";
      element.classList.remove("preset-result-card--active");
    });
  });
});
