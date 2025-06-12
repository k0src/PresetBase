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

/* ----------------------------- Doughnut Chart ----------------------------- */
const chartContainer = document.querySelector(".browse-chart-container");

let doughnutChart;

const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !doughnutChart) {
        createChart();
        observer.disconnect();
      }
    });
  },
  {
    threshold: 0.5,
  }
);

const createChart = async function () {
  try {
    const res = await fetch("/browse/chart-data");
    if (!res.ok) throw new Error("Fetch failed");

    const { labels, values } = await res.json();

    const ctx = document.getElementById("synthPresetChart").getContext("2d");
    doughnutChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Presets",
            data: values,
            backgroundColor: [
              "#7B61FF",
              "#1FB2A6",
              "#FFD166",
              "#EF476F",
              "#118AB2",
            ],
            borderColor: "#171B1F",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: "#E0E0E0",
              font: {
                family: "Geist, sans-serif",
                size: 14,
                weight: "400",
              },
              boxWidth: 18,
              padding: 15,
            },
          },
          tooltip: {
            backgroundColor: "#2d343a",
            titleColor: "#e3e5e4",
            bodyColor: "#899096",
            borderColor: "#171B1F",
            borderWidth: 1,
            titleFont: { family: "Geist, sans-serif", weight: "600" },
            bodyFont: { family: "Geist, sans-serif" },
          },
        },
        layout: {
          padding: {
            right: 2,
            left: 2,
          },
        },
      },
    });
  } catch (err) {
    console.error(err);
  }
};

observer.observe(chartContainer);
