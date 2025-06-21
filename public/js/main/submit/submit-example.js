document.addEventListener("DOMContentLoaded", () => {
  const playBtnsContainers = document.querySelectorAll(
    ".audio-upload-btn-container"
  );

  playBtnsContainers.forEach((container) => {
    const playBtn = container.querySelector(".audio-upload--play-btn");
    const stopBtn = container.querySelector(".audio-upload--play-btn-active");

    playBtn.addEventListener("click", () => {
      document.querySelectorAll(".uploaded-audio").forEach((otherAudio) => {
        if (!otherAudio.paused) {
          otherAudio.pause();
          otherAudio.currentTime = 0;

          const otherContainer = otherAudio
            .closest(".audio-upload-container")
            .querySelector(".audio-upload-btn-container");
          otherContainer
            .querySelector(".audio-upload--play-btn")
            .classList.remove("hidden");
          otherContainer
            .querySelector(".audio-upload--play-btn-active")
            .classList.add("hidden");
        }
      });

      const audio = container
        .closest(".audio-upload-container")
        .querySelector(".uploaded-audio");

      if (audio.paused) {
        audio.play();

        playBtn.classList.add("hidden");
        stopBtn.classList.remove("hidden");
      } else {
        audio.pause();
        audio.currentTime = 0;

        playBtn.classList.remove("hidden");
        stopBtn.classList.add("hidden");
      }

      audio.addEventListener("ended", () => {
        playBtn.classList.remove("hidden");
        stopBtn.classList.add("hidden");
      });
    });

    stopBtn.addEventListener("click", () => {
      const audio = container
        .closest(".audio-upload-container")
        .querySelector(".uploaded-audio");

      audio.pause();
      audio.currentTime = 0;

      playBtn.classList.remove("hidden");
      stopBtn.classList.add("hidden");
    });
  });
});
