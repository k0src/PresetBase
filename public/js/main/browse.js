/* --------------------------- Hot Songs Carousel --------------------------- */
const track = document.querySelector(".hot-songs-carousel--track");
const dots = document.querySelectorAll(".carousel--nav-dot");

let currentTrack = 0;
let autoSlideInterval;
let userInteract = false;

const moveCarousel = function (index) {
  const carousel = document.querySelector(".hot-songs-carousel");
  carousel.classList.add("carousel-moving");
  
  const offset = -index * 1128;
  track.style.transform = `translateX(${offset}px)`;

  dots.forEach((dot) => dot.classList.remove("nav-dot--active"));
  dots[index].classList.add("nav-dot--active");
  currentTrack = index;

  setTimeout(() => {
    carousel.classList.remove("carousel-moving");
  }, 300);
};

const startAutoSlide = function () {
  autoSlideInterval = setInterval(() => {
    if (userInteract) return;

    moveCarousel((currentTrack + 1) % 3);
  }, 5000);
};

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    userInteract = true;
    clearInterval(autoSlideInterval);
    moveCarousel(index);
  });
});

startAutoSlide();
