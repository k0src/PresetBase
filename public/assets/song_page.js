const cardLinks = document.querySelectorAll(".result-info-wrapper");
const presetAudioPlayContainers = document.querySelectorAll(
  ".preset-audio-container"
);
const presetAudioPlayBtns = document.querySelectorAll(".preset-audio-play");

cardLinks.forEach((element) => {
  const synthId = JSON.parse(decodeURIComponent(element.dataset.synthId));

  element.addEventListener("click", () => {
    window.location.href = `/synth/${synthId}`;
  });
});

presetAudioPlayContainers.forEach((element) => {
  element.addEventListener("mouseover", () => {
    const synthImg = element.querySelector(".result-img");
    const playBtn = element.querySelector(".preset-audio-play");

    synthImg.classList.add("result-img--active");
    playBtn.classList.add("preset-audio-play--active");
  });
});

presetAudioPlayContainers.forEach((element) => {
  element.addEventListener("mouseout", () => {
    const synthImg = element.querySelector(".result-img");
    const playBtn = element.querySelector(".preset-audio-play");

    synthImg.classList.remove("result-img--active");
    playBtn.classList.remove("preset-audio-play--active");
  });
});

presetAudioPlayBtns.forEach((element) => {
  element.addEventListener("click", () => {
    presetAudioPlayBtns.forEach((btn) => {
      if (btn !== element) {
        const otherResultCard = btn.closest(".result-card");
        const otherSynthBGImg = otherResultCard.querySelector(".result-img");
        const otherAudio = otherResultCard.querySelector(".preset--audio");

        otherSynthBGImg.classList.remove("result-img--active");
        otherResultCard.classList.remove("result-card--active");
        btn.classList.remove("preset-audio-play--active");
        btn.textContent = "play_circle";

        if (!otherAudio.paused) {
          otherAudio.pause();
          otherAudio.currentTime = 0;
        }
      }
    });

    const resultCard = element.closest(".result-card");
    const synthBGImg = resultCard.querySelector(".result-img");
    const audio = resultCard.querySelector(".preset--audio");

    element.textContent =
      element.textContent === "play_circle" ? "stop_circle" : "play_circle";

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
      audio.currentTime = 0;
    }

    audio.addEventListener("ended", () => {
      element.textContent = "play_circle";
      synthBGImg.classList.remove("result-img--active");
      resultCard.classList.remove("result-card--active");
      element.classList.remove("preset-audio-play--active");
    });
  });
});
