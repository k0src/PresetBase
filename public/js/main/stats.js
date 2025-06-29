/* ---------------------------- Top presets chart --------------------------- */
let topPresetsChart;
let synthsPerPresetsChart;
let topSynthsChart;
let synthTimeChart;

const synthsChartContainer = document.querySelector(".synth-charts-container");
const synthTimeChartContainer = document.querySelector(
  ".synth-time-chart-container"
);
const communityStatsContainer = document.querySelector(
  ".community-stats-container"
);
const communityStatsNumbers = document.querySelectorAll(
  ".community-stats-number"
);

const createTopPresetsChart = async function () {
  try {
    const res = await fetch("/stats/top-presets-data");
    if (!res.ok) throw new Error("Fetch failed");

    const { labels, values } = await res.json();
    const ctx = document.getElementById("topPresetChart").getContext("2d");

    topPresetsChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "",
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
        plugins: {
          legend: {
            display: false,
            position: "top",
            labels: {
              color: "#E0E0E0",
              font: {
                family: "Geist, sans-serif",
                size: 14,
                weight: "400",
              },
            },
          },
          tooltip: {
            backgroundColor: "#2d343a",
            titleColor: "#e3e5e4",
            bodyColor: "#899096",
            borderColor: "#171B1F",
            borderWidth: 1,
            titleFont: { family: "Geist, sans-serif", weight: "600", size: 18 },
            bodyFont: { family: "Geist, sans-serif", size: 18 },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Presets",
              font: {
                size: 14,
              },
            },
            ticks: {
              font: {
                size: 14,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: "Usage Count",
              font: {
                size: 14,
              },
            },
            beginAtZero: true,
            ticks: {
              font: {
                size: 14,
              },
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("Error creating top presets chart:", err);
  }
};

const createPresetsPerSynthChart = async function () {
  try {
    const res = await fetch("/stats/presets-per-synth-data");
    if (!res.ok) throw new Error("Fetch failed");

    const { labels, values } = await res.json();

    const ctx = document
      .getElementById("presetsPerSynthChart")
      .getContext("2d");
    synthsPerPresetsChart = new Chart(ctx, {
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
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              color: "#899096",
              font: {
                family: "Geist, sans-serif",
                size: 14,
                weight: "400",
              },
            },
          },
          tooltip: {
            backgroundColor: "#2d343a",
            titleColor: "#899096",
            bodyColor: "#899096",
            borderColor: "#171B1F",
            borderWidth: 1,
            titleFont: { family: "Geist, sans-serif", weight: "600" },
            bodyFont: { family: "Geist, sans-serif" },
          },
        },
      },
    });
  } catch (err) {
    console.error("Error creating presets per synth chart:", err);
  }
};

const createTopSynthsChart = async function () {
  try {
    const res = await fetch("/stats/top-synths-data");
    if (!res.ok) throw new Error("Fetch failed");

    const { labels, values } = await res.json();

    const ctx = document.getElementById("topSynthsChart").getContext("2d");
    topSynthsChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Songs",
            data: values,
            backgroundColor: [
              "#7B61FF",
              "#1FB2A6",
              "#FFD166",
              "#EF476F",
              "#118AB2",
            ],
            borderColor: "#171B1F",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              color: "#899096",
              font: {
                family: "Geist, sans-serif",
                size: 14,
                weight: "400",
              },
            },
          },
          tooltip: {
            backgroundColor: "#2d343a",
            titleColor: "#899096",
            bodyColor: "#899096",
            borderColor: "#171B1F",
            borderWidth: 1,
            titleFont: { family: "Geist, sans-serif", weight: "600" },
            bodyFont: { family: "Geist, sans-serif" },
          },
        },
      },
    });
  } catch (err) {
    console.error("Error creating top synths chart:", err);
  }
};

const createSynthTimeChart = async function () {
  try {
    const res = await fetch("/stats/synth-time-data");
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

    const { chartData } = await res.json();

    const labels = [...new Set(chartData.map((row) => row.month))];

    const synthMap = {};
    chartData.forEach((row) => {
      if (!synthMap[row.synth_name]) {
        synthMap[row.synth_name] = {};
      }
      synthMap[row.synth_name][row.month] = parseInt(row.total_clicks) || 0;
    });

    const synthColors = ["#7B61FF", "#1FB2A6", "#FFD166", "#EF476F", "#118AB2"];
    const datasets = Object.entries(synthMap).map(([synth, clicks], i) => ({
      label: synth,
      data: labels.map((month) => clicks[month] || 0),
      fill: false,
      tension: 0.4,
      borderColor: synthColors[i % synthColors.length],
      backgroundColor: synthColors[i % synthColors.length],
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }));

    const ctx = document.getElementById("synthTimeChart").getContext("2d");

    synthTimeChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              color: "#899096",
              font: {
                family: "Geist, sans-serif",
                size: 14,
                weight: "400",
              },
            },
          },
          tooltip: {
            backgroundColor: "#2d343a",
            titleColor: "#899096",
            bodyColor: "#899096",
            borderColor: "#171B1F",
            borderWidth: 1,
            titleFont: { family: "Geist, sans-serif", weight: "600", size: 14 },
            bodyFont: { family: "Geist, sans-serif", size: 14 },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Month",
              font: {
                size: 14,
              },
              color: "#899096",
            },
            ticks: {
              font: {
                size: 14,
              },
              color: "#899096",
            },
          },
          y: {
            title: {
              display: true,
              text: "Clicks",
              font: {
                size: 14,
              },
              color: "#899096",
            },
            beginAtZero: true,
            ticks: {
              font: {
                size: 14,
              },
              color: "#899096",
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("Error creating synths over time chart:", err);
  }
};

/* --------------------------------- Heatmap -------------------------------- */
const getHeatmapData = async function () {
  try {
    const response = await fetch("/stats/heatmap-data");
    const json = await response.json();

    if (!json.chartData || !Array.isArray(json.chartData)) {
      console.error("Invalid data structure:", json);
      return [];
    }

    const dataArray = [];
    for (const { date, count } of json.chartData) {
      if (!date || count === undefined) {
        console.warn("Invalid data entry:", { date, count });
        continue;
      }

      const dateObj = new Date(date);
      dataArray.push({
        date: dateObj,
        value: count,
      });
    }

    return dataArray;
  } catch (error) {
    console.error("Error fetching heatmap data:", error);
    return [];
  }
};

let cal;

const createHeatmap = async function () {
  const data = await getHeatmapData();

  if (!data || data.length === 0) {
    console.warn("No heatmap data available.");
    document.getElementById("cal-heatmap").innerHTML =
      '<p style="color: #899096; text-align: center; padding: 20px;">No data available</p>';
    return;
  }

  const dates = data.map((d) => d.date);
  const minDate = new Date(Math.min(...dates));

  cal = new CalHeatmap();

  await cal.paint(
    {
      itemSelector: "#cal-heatmap",
      data: {
        source: data,
        type: "json",
        x: "date",
        y: "value",
      },
      date: {
        start: minDate,
      },
      range: 12,
      scale: {
        color: {
          type: "threshold",
          range: ["#0e4429", "#006d32", "#26a641", "#39d353"],
          domain: [1, 3, 5, 10],
        },
      },
      domain: {
        type: "month",
        gutter: 4,
        label: {
          text: "MMM",
          textAlign: "start",
          position: "top",
        },
        dynamicDimension: true,
      },
      subDomain: {
        type: "ghDay",
        radius: 2,
        width: 14,
        height: 14,
        gutter: 4,
      },
      verticalOrientation: false,
    },
    [
      [
        Tooltip,
        {
          text: function (date, value, dayjsDate) {
            return (
              (value ? value : "No") +
              " submissions on " +
              dayjsDate.format("dddd, MMMM D, YYYY")
            );
          },
        },
      ],
      [
        LegendLite,
        {
          includeBlank: true,
          itemSelector: "#cal-heatmap-legend",
          radius: 2,
          width: 14,
          height: 14,
          gutter: 4,
        },
      ],
      [
        CalendarLabel,
        {
          width: 30,
          textAlign: "start",
          text: () => ["", "Mon", "", "Wed", "", "Fri", ""],
          padding: [25, 0, 0, 0],
        },
      ],
    ]
  );

  document.getElementById("prev-btn").addEventListener("click", function (e) {
    e.preventDefault();
    cal.previous();
  });

  document.getElementById("next-btn").addEventListener("click", function (e) {
    e.preventDefault();
    cal.next();
  });

  console.log("Heatmap created successfully");
};

window.addEventListener("resize", () => {
  cal?.paint?.();
});

const playCommunityStatsNumbersAnimatons = function () {
  communityStatsNumbers.forEach((el) => {
    el.classList.add("animate");
  });
};

/* ----------------------------- Chart Observers ---------------------------- */
const synthsChartsObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        createPresetsPerSynthChart();
        createTopSynthsChart();
        observer.disconnect();
      }
    });
  },
  {
    threshold: 0.5,
  }
);

const synthTimeObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        createSynthTimeChart();
        observer.disconnect();
      }
    });
  },
  {
    threshold: 0.5,
  }
);

const communityStatsObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        playCommunityStatsNumbersAnimatons();
        createHeatmap();
        observer.disconnect();
      }
    });
  },
  {
    threshold: 0.5,
  }
);

document.addEventListener("DOMContentLoaded", () => {
  createTopPresetsChart();
  synthsChartsObserver.observe(synthsChartContainer);
  synthTimeObserver.observe(synthTimeChartContainer);
  communityStatsObserver.observe(communityStatsContainer);
});
