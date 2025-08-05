import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import DbStatsCards from "../../../components/Stats/DbStatsCards/DbStatsCards";
import TopPresetsChart from "../../../components/Stats/TopPresetsChart/TopPresetsChart";
import PresetsPerSynthChart from "../../../components/Stats/PresetsPerSynthChart/PresetsPerSynthChart";
import TopSynthsChart from "../../../components/Stats/TopSynthsChart/TopSynthsChart";
import SynthTimeChart from "../../../components/Stats/SynthTimeChart/SynthTimeChart";
import CommunityStats from "../../../components/Stats/CommunityStats/CommunityStats";
import HeatmapChart from "../../../components/Stats/HeatmapChart/HeatmapChart";
import PageLoader from "../../../components/PageLoader/PageLoader";
import DbError from "../../../components/DbError/DbError";
import { useStatsData } from "../../../hooks/useStatsData";
import styles from "./StatsPage.module.css";
import classNames from "classnames";

export default function StatsPage() {
  const { data, loading, error, refetchHeatmapData } = useStatsData();

  if (loading) return <PageLoader />;
  if (error) return <DbError errorMessage={error} />;

  return (
    <>
      <Helmet>
        <title>Stats</title>
      </Helmet>
      <ContentContainer isAuth={true} userIsAdmin={true}>
        <header className={styles.statsHeader}>
          <h1 className={styles.headingPrimary}>Stats</h1>
        </header>

        <h2
          className={classNames(styles.headingSecondary, styles.textCentered)}
        >
          Current Database Stats
        </h2>
        <DbStatsCards data={data.totalEntries} />

        <div className={styles.statsHeaderSecondaryLink}>
          <h2 className={styles.headingSecondary}>Top Presets</h2>
          <Link to="/browse/presets" className={styles.statsLink}>
            View More Presets
          </Link>
        </div>

        <div
          className={classNames(
            styles.wideChartContainer,
            styles.topPresetsContainer
          )}
        >
          <TopPresetsChart data={data.topPresets} />
        </div>

        <div className={styles.synthChartsContainer}>
          <div>
            <div className={styles.statsHeaderSecondary}>
              <h2 className={styles.headingSecondary}>Presets per Synth</h2>
            </div>
            <div
              className={classNames(
                styles.wideChartContainer,
                styles.presetsPerSynthChartContainer
              )}
            >
              <PresetsPerSynthChart data={data.presetsPerSynth} />
            </div>
          </div>

          <div>
            <div className={styles.statsHeaderSecondary}>
              <h2 className={styles.headingSecondary}>Top Synths by Song</h2>
            </div>
            <div
              className={classNames(
                styles.wideChartContainer,
                styles.topPresetsChartContainer
              )}
            >
              <TopSynthsChart data={data.topSynths} />
            </div>
          </div>
        </div>

        <div className={styles.statsHeaderSecondaryLink}>
          <h2 className={styles.headingSecondary}>
            Synth Popularity Over Time
          </h2>
          <Link to="/browse/synths" className={styles.statsLink}>
            View More Synths
          </Link>
        </div>

        <div className={styles.wideChartContainer}>
          <SynthTimeChart data={data.synthTimeData} />
        </div>

        <div className={styles.statsHeaderSecondary}>
          <h2 className={styles.headingSecondary}>Community Stats</h2>
        </div>

        <div className={styles.communityStatsContainer}>
          <HeatmapChart
            data={data.heatmapData}
            currentYear={data.currentYear}
            onYearChange={refetchHeatmapData}
          />
          <CommunityStats data={data.communityStats} />
        </div>
      </ContentContainer>
    </>
  );
}
