import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { getTopPresetsData } from "../../../api/stats";
import PageLoader from "../../PageLoader/PageLoader";
import DbError from "../../DbError/DbError";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TopPresetsChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getTopPresetsData();
        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: "",
              data: data.values,
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
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
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
  };

  if (loading) return <PageLoader />;
  if (error) return <DbError errorMessage={error} />;

  return <Bar data={chartData} options={options} />;
}
