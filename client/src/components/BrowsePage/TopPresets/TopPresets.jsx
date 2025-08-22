import { memo, useCallback } from "react";
import styles from "./TopPresets.module.css";
import classNames from "classnames";

export default memo(function TopPresets({ presetsData }) {
  const getRankClass = useCallback((index) => {
    if (index === 0) return styles.rankFirst;
    if (index === 1) return styles.rankSecond;
    if (index === 2) return styles.rankThird;
    return "";
  }, []);

  const formatUsageCount = useCallback((count) => {
    return count > 999 ? "999+" : count.toString();
  }, []);

  if (!presetsData || presetsData.length === 0) {
    return (
      <div className={styles.topPresetsContainer}>
        <p className={styles.noPresets}>No presets available</p>
      </div>
    );
  }

  return (
    <div className={styles.topPresetsContainer}>
      <div className={styles.tableHeader}>
        <span className={styles.headerRank}>#</span>
        <span className={styles.headerPreset}>Preset</span>
        <span className={styles.headerSynth}>Synth</span>
        <span className={styles.headerUsageType}>Type</span>
        <span className={styles.headerUsageCount}>Usage Count</span>
      </div>

      <div className={styles.tableBody}>
        {presetsData.map((preset, index) => {
          const rankClass = getRankClass(index);
          return (
            <div key={preset.id} className={styles.tableRow}>
              <span className={classNames(styles.rankNumber, rankClass)}>
                {index + 1}
              </span>

              <div className={styles.presetCell}>
                <span className={styles.presetName}>{preset.name}</span>
              </div>

              <div className={styles.synthCell}>
                <span className={styles.synthName}>{preset.synth.name}</span>
              </div>

              <div className={styles.usageTypeCell}>
                <span className={styles.usageTypeText}>{preset.usageType}</span>
              </div>

              <div className={styles.usageCountCell}>
                <div className={styles.usageCountWrapper}>
                  <span className={styles.usageCountNumber}>
                    {formatUsageCount(preset.usageCount)}
                  </span>
                  <div className={styles.usageCountBar}>
                    <div
                      className={classNames(styles.usageCountFill, rankClass)}
                      style={{
                        width: `${Math.min(
                          100,
                          (preset.usageCount / presetsData[0].usageCount) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
