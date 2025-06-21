/* ---------------------------------- Post ---------------------------------- */
const post = function (url) {
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
  })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      window.location.reload();
    })
    .catch((error) => {
      console.error("POST request failed:", error);
      alert("Action failed. Please try again.");
    });
};

/* ---------------------------- Reload selection ---------------------------- */
const handleInputSelections = function () {
  handleImgInputs();
  handleAudioInputs();
};

/* ----------------------------- Single checkboxes -------------------------- */
const singleCheckBoxes = document.querySelectorAll(".single-checkbox");
console.log(singleCheckBoxes);

singleCheckBoxes.forEach((singleCheckBox) => {
  const albumSingleInput = singleCheckBox
    .closest(".album-field-set")
    .querySelector('input[name="single"]');
  const albumFields = singleCheckBox
    .closest(".album-field-set")
    .querySelectorAll(".album-field");

  singleCheckBox.addEventListener("change", () => {
    const isChecked = singleCheckBox.checked;

    albumSingleInput.value = isChecked ? "yes" : "no";

    albumFields.forEach((field) => {
      const fileInputField = field.closest(".custom-file-input");

      if (isChecked) {
        field.removeAttribute("required");
        field.setAttribute("disabled", "true");
        if (fileInputField) fileInputField.classList.add("disabled");
      } else {
        field.setAttribute("required", "true");
        field.removeAttribute("disabled");
        if (fileInputField) fileInputField.classList.remove("disabled");
      }
    });
  });
});

/* ------------------------------ Image inputs ------------------------------ */
const handleImgInputs = function () {
  const imgInputs = document.querySelectorAll(".imageInput");

  imgInputs.forEach((imgInput) => {
    imgInput.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;

      // Validate image
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onerror = function () {
        alert("Invalid image file.");
      };

      img.onload = function () {
        if (img.width < 1000 || img.height < 1000) {
          alert("Image must be at least 1000x1000 pixels.");
        } else {
          // Change filename
          const fileNameDisplay = imgInput
            .closest(".custom-file-input")
            .querySelector(".file-name");

          fileNameDisplay.textContent = file.name;

          // Display image
          const imgDisplay = imgInput
            .closest(".img-upload-container")
            .querySelector(".img-upload-display");

          imgDisplay.src = img.src;
        }

        URL.revokeObjectURL(img.src);
      };
    });
  });
};

/* --------------------------- Preset audio inputs -------------------------- */
const handleAudioPlayback = function (playBtns) {
  const playBtn = playBtns.querySelector(".audio-upload--play-btn");
  const stopBtn = playBtns.querySelector(".audio-upload--play-btn-active");

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

    const audio = playBtns
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
    const audio = playBtns
      .closest(".audio-upload-container")
      .querySelector(".uploaded-audio");

    audio.pause();
    audio.currentTime = 0;

    playBtn.classList.remove("hidden");
    stopBtn.classList.add("hidden");
  });
};

const setupAudio = function (input, audioSrc, fileName = null) {
  const container = input.closest(".audio-upload-container");
  const audioDisplay = container.querySelector(".uploaded-audio");
  const playBtns = container.querySelector(".audio-upload-btn-container");
  const fileNameDisplay = input
    .closest(".custom-file-input")
    ?.querySelector(".file-name");

  if (fileName && fileNameDisplay) {
    fileNameDisplay.textContent = fileName;
  }

  audioDisplay.src = audioSrc;
  handleAudioPlayback(playBtns);
};

const handleAudioInputs = function () {
  const audioInputs = document.querySelectorAll(".audioInput");

  audioInputs.forEach((audioInput) => {
    const container = audioInput.closest(".audio-upload-container");
    const audioDisplay = container.querySelector(".uploaded-audio");
    const playBtns = container.querySelector(".audio-upload-btn-container");

    // Handle preloaded audio
    if (audioDisplay?.src) {
      handleAudioPlayback(playBtns);
    }

    // Handle file uploads
    audioInput.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;

      // Validate Audio
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);

      audio.onerror = function () {
        alert("Invalid audio file.");
      };

      audio.onloadedmetadata = function () {
        if (audio.duration > 120) {
          alert("Audio file must be 2 minutes or less.");
        } else {
          setupAudio(audioInput, audio.src, file.name);
        }
      };
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  handleInputSelections();
});
