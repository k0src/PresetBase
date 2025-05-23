const cardLinks = document.querySelectorAll(".result-info-wrapper");
const presetAudioPlayContainer = document.querySelectorAll(
  ".preset-audio-container"
);
const presetAudioPlayBtn = document.querySelectorAll(".preset-audio-play");

cardLinks.forEach((element) => {
  const synth_id = JSON.parse(decodeURIComponent(element.dataset.synthId));

  element.addEventListener("click", () => {
    window.location.href = `/synth/${synth_id}`;
  });
});

presetAudioPlayContainer.forEach((element) => {
  element.addEventListener("mouseover", () => {
    element
      .querySelector(".preset-audio-play")
      .classList.add("preset-audio-play--active");
  });
});

presetAudioPlayContainer.forEach((element) => {
  element.addEventListener("mouseout", () => {
    element
      .querySelector(".preset-audio-play")
      .classList.remove("preset-audio-play--active");
  });
});

presetAudioPlayBtn.forEach((element) => {
  element.addEventListener("click", () => {
    presetAudioPlayBtn.forEach((btn) => {
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

    synthBGImg.classList.toggle("result-img--active");
    resultCard.classList.toggle("result-card--active");
    element.classList.toggle("preset-audio-play--active");
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
