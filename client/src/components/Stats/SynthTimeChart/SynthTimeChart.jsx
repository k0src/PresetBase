import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { getSynthTimeData } from "../../../api/stats";
import PageLoader from "../../PageLoader/PageLoader";
import DbError from "../../DbError/DbError";
import styles from "./SynthTimeChart.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function SynthTimeChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { chartData: rawData } = await getSynthTimeData();

        const labels = [...new Set(rawData.map((row) => row.month))];

        const synthMap = {};
        rawData.forEach((row) => {
          if (!synthMap[row.synth_name]) {
            synthMap[row.synth_name] = {};
          }
          synthMap[row.synth_name][row.month] = parseInt(row.total_clicks) || 0;
        });

        const synthColors = [
          "#7B61FF",
          "#1FB2A6",
          "#FFD166",
          "#EF476F",
          "#118AB2",
        ];
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

        setChartData({
          labels: labels,
          datasets: datasets,
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
  };

  if (loading) return <PageLoader />;
  if (error) return <DbError errorMessage={error} />;

  return (
    <div className={styles.chartContainer}>
      <Line data={chartData} options={options} />
    </div>
  );
}
