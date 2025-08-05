import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PresetsPerSynthChart({ data }) {
  if (!data) return null;

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Presets",
        data: data.values,
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
  };

  const options = {
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
  };

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
