import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import { getPresetsPerSynthData } from "../../../api/stats";
import PageLoader from "../../PageLoader/PageLoader";
import DbError from "../../DbError/DbError";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PresetsPerSynthChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getPresetsPerSynthData();
        setChartData({
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
        titleFont: { family: "Geist, sans-serif", weight: "600" },
        bodyFont: { family: "Geist, sans-serif" },
      },
    },
  };

  if (loading) return <PageLoader />;
  if (error) return <DbError errorMessage={error} />;

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
