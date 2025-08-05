import HeatMap from "@uiw/react-heat-map";
import styles from "./HeatmapChart.module.css";

export default function HeatmapChart({ data, currentYear, onYearChange }) {
  if (!data) return null;

  const { chartData } = data;

  const heatmapData = [];
  for (const { date, count } of chartData) {
    if (!date || count === undefined) {
      console.warn("Invalid data entry:", { date, count });
      continue;
    }

    heatmapData.push({
      date: date,
      count: count,
    });
  }

  const handlePreviousYear = () => {
    onYearChange(currentYear - 1);
  };

  const handleNextYear = () => {
    const maxYear = new Date().getFullYear();
    if (currentYear < maxYear) {
      onYearChange(currentYear + 1);
    }
  };

  if (!heatmapData || heatmapData.length === 0) {
    return (
      <div className={styles.heatmapContainer}>
        <p className={styles.noData}>No data available</p>
      </div>
    );
  }

  return (
    <div className={styles.heatmapContainer}>
      <div className={styles.heatmapWrapper}>
        <HeatMap
          value={heatmapData}
          width="100%"
          height="100%"
          style={{ color: "#899096" }}
          startDate={new Date(`${currentYear}-01-01`)}
          endDate={new Date(`${currentYear}-12-31`)}
          rectSize={18}
          rectProps={{
            rx: 2,
          }}
          panelColors={{
            0: "#0e4429",
            2: "#006d32",
            4: "#26a641",
            10: "#39d353",
            20: "#39d353",
          }}
          rectRender={(props, data) => {
            if (!data.count) return <rect {...props} />;
            return (
              <rect
                {...props}
                data-tooltip={`${data.count || 0} submissions on ${data.date}`}
              />
            );
          }}
        />
      </div>
      <div className={styles.clearfix}>
        <div className={styles.navigationButtons}>
          <button className={styles.navButton} onClick={handlePreviousYear}>
            &lt;
          </button>
          <span className={styles.yearText}>{currentYear}</span>
          <button
            className={styles.navButton}
            onClick={handleNextYear}
            disabled={currentYear >= new Date().getFullYear()}
          >
            &gt;
          </button>
        </div>
        <div className={styles.legendContainer}>
          <span className={styles.legendText}>Less</span>
          <div className={styles.legend}>
            <div
              className={styles.legendSquare}
              style={{ backgroundColor: "#0e4429" }}
            ></div>
            <div
              className={styles.legendSquare}
              style={{ backgroundColor: "#006d32" }}
            ></div>
            <div
              className={styles.legendSquare}
              style={{ backgroundColor: "#26a641" }}
            ></div>
            <div
              className={styles.legendSquare}
              style={{ backgroundColor: "#39d353" }}
            ></div>
          </div>
          <span className={styles.legendText}>More</span>
        </div>
      </div>
    </div>
  );
}
