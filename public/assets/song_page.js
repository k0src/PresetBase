// const cardLinks = document.querySelectorAll(".result-info-wrapper");
// const presetAudioPlayContainers = document.querySelectorAll(
//   ".preset-audio-container"
// );
// const presetAudioPlayBtns = document.querySelectorAll(".preset-audio-play");

// cardLinks.forEach((element) => {
//   const synthId = JSON.parse(decodeURIComponent(element.dataset.synthId));

//   element.addEventListener("click", () => {
//     window.location.href = `/synth/${synthId}`;
//   });
// });

// presetAudioPlayContainers.forEach((element) => {
//   element.addEventListener("mouseover", () => {
//     const synthImg = element.querySelector(".result-img");
//     const playBtn = element.querySelector(".preset-audio-play");

//     synthImg.classList.add("result-img--active");
//     playBtn.classList.add("preset-audio-play--active");
//   });
// });

// presetAudioPlayContainers.forEach((element) => {
//   element.addEventListener("mouseout", () => {
//     const synthImg = element.querySelector(".result-img");
//     const playBtn = element.querySelector(".preset-audio-play");

//     synthImg.classList.remove("result-img--active");
//     playBtn.classList.remove("preset-audio-play--active");
//   });
// });

// presetAudioPlayBtns.forEach((element) => {
//   element.addEventListener("click", () => {
//     presetAudioPlayBtns.forEach((btn) => {
//       if (btn !== element) {
//         const otherResultCard = btn.closest(".result-card");
//         const otherSynthBGImg = otherResultCard.querySelector(".result-img");
//         const otherAudio = otherResultCard.querySelector(".preset--audio");

//         otherSynthBGImg.classList.remove("result-img--active");
//         otherResultCard.classList.remove("result-card--active");
//         btn.classList.remove("preset-audio-play--active");
//         btn.textContent = "play_circle";

//         if (!otherAudio.paused) {
//           otherAudio.pause();
//           otherAudio.currentTime = 0;
//         }
//       }
//     });

//     const resultCard = element.closest(".result-card");
//     const synthBGImg = resultCard.querySelector(".result-img");
//     const audio = resultCard.querySelector(".preset--audio");

//     element.textContent =
//       element.textContent === "play_circle" ? "stop_circle" : "play_circle";

//     if (audio.paused) {
//       audio.play();
//     } else {
//       audio.pause();
//       audio.currentTime = 0;
//     }

//     audio.addEventListener("ended", () => {
//       element.textContent = "play_circle";
//       synthBGImg.classList.remove("result-img--active");
//       resultCard.classList.remove("result-card--active");
//       element.classList.remove("preset-audio-play--active");
//     });
//   });
// });

const openSynthContainers = document.querySelectorAll(".open-synth-container");
const presetAudioPlayBtns = document.querySelectorAll(".preset-audio-play");
const presetResultCards = document.querySelectorAll(".result-card");

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

    element.classList.toggle("result-card--active");
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
      element.classList.remove("result-card--active");
    });
  });
});
