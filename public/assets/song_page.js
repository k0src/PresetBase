const openSynthContainers = document.querySelectorAll(".open-synth-container");
const presetAudioPlayBtns = document.querySelectorAll(".preset-audio-play");
const presetResultCards = document.querySelectorAll(".result-info-wrapper");
const coverImg = document.querySelector(".cover-image");

coverImg.addEventListener("click", () => {
  window.open(coverImg.dataset.songYtLink, "_blank");
});

openSynthContainers.forEach((element) => {
  element.addEventListener("mouseover", () => {
    const coverImg = element.querySelector(".result-img");
    const openIcon = element.querySelector(".open-synth-overlay-icon");

    coverImg.classList.add("result-img--active");
    openIcon.classList.add("open-synth-overlay-icon--active");
  });
});

openSynthContainers.forEach((element) => {
  element.addEventListener("mouseout", () => {
    const coverImg = element.querySelector(".result-img");
    const openIcon = element.querySelector(".open-synth-overlay-icon");

    coverImg.classList.remove("result-img--active");
    openIcon.classList.remove("open-synth-overlay-icon--active");
  });
});

openSynthContainers.forEach((element) => {
  element.addEventListener("click", () => {
    const synthId = JSON.parse(decodeURIComponent(element.dataset.synthId));
    window.location.href = `/synth/${synthId}`;
  });
});

presetResultCards.forEach((element) => {
  element.addEventListener("click", () => {
    const playBtn = element.querySelector(".preset-audio-play");
    presetAudioPlayBtns.forEach((btn) => {
      if (btn !== playBtn) {
        const otherPresetResultCard = btn.closest(".result-card");
        const otherAudio =
          otherPresetResultCard.querySelector(".preset--audio");

        otherPresetResultCard.classList.remove("result-card--active");
        btn.textContent = "play_circle";
        btn.classList.remove("preset-audio-play--active");

        if (!otherAudio.paused) {
          otherAudio.pause();
          otherAudio.currentTime = 0;
        }
      }
    });

    const audio = element.querySelector(".preset--audio");

    element.closest(".result-card").classList.toggle("result-card--active");
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
      element.closest(".result-card").classList.remove("result-card--active");
    });
  });
});
