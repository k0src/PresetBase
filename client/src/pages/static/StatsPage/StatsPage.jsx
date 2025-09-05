import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import DbStatsCards from "../../../components/DbStatsCards/DbStatsCards";
import PageLoader from "../../../components/PageLoader/PageLoader";
import DbError from "../../../components/DbError/DbError";
import ComponentLoader from "../../../components/ComponentLoader/ComponentLoader";
import { BounceLoader } from "react-spinners";
// import { useStatsData } from "../../../hooks/useStatsData";
import styles from "./StatsPage.module.css";
import classNames from "classnames";

import { useAsyncData } from "../../../hooks/useAsyncData";
import { statsAPI } from "../../../api/stats";

import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { chartsTooltipClasses } from "@mui/x-charts";

export default function StatsPage() {
  const { data, loading, error } = useAsyncData(
    {
      topPresets: () => statsAPI.getTopPresets(),
      topSynths: () => statsAPI.getTopSynths(),
      topArtists: () => statsAPI.getTopArtists(),
      weeklySubmissions: () => statsAPI.getWeeklySubmissions(),
      dailyContentActivity: () => statsAPI.getDailyContentActivity(),
      genreDistribution: () => statsAPI.getGenreDistribution(),
      cumulativeSubmissions: () => statsAPI.getCumulativeSubmissions(),
      synthEraDistribution: () => statsAPI.getSynthEraDistribution(),
      weeklyDiscoveryRate: () => statsAPI.getWeeklyDiscoveryRate(),
      deepCuts: () => statsAPI.getDeepCuts(),
      songOfMonth: () => statsAPI.getSongOfMonth(),
    },
    [],
    { cacheKey: "stats" }
  );

  const topPresetsData = data.topPresets || null;
  const topSynthsData = data.topSynths || null;
  const topArtistsData = data.topArtists || null;
  const weeklySubmissionsData = data.weeklySubmissions || null;
  const dailyContentActivityData = data.dailyContentActivity || null;
  const genreDistributionData = data.genreDistribution || null;
  const cumulativeSubmissionsData = data.cumulativeSubmissions || null;
  const synthEraDistributionData = data.synthEraDistribution || null;
  const weeklyDiscoveryRateData = data.weeklyDiscoveryRate || null;
  const deepCutsData = data.deepCuts || null;
  const songOfMonthData = data.songOfMonth || null;

  // Have at least 3 presets used (high preset usage)
  // Have fewer than 50 clicks (low visibility)
  // Ranked by "deep cut score" = (presets used / clicks) * 100

  // song of month = most presets used in last month

  if (loading) {
    return <PageLoader />;
  }

  const cumulativeData = cumulativeSubmissionsData.map(
    (item) => item.cumulativeCount
  );
  const dates = cumulativeSubmissionsData.map((item) => item.submissionDate);

  const discoveryData = weeklyDiscoveryRateData.map((item) => item.newArtists);
  const weeks = weeklyDiscoveryRateData.map((item) => item.weekStart);

  return (
    <>
      <Helmet>
        <title>Stats</title>
      </Helmet>

      <ContentContainer>
        <header className={styles.statsHeader}>
          <h1 className={styles.headingPrimary}>Stats</h1>
        </header>
        <div className={styles.chartsContainer}>
          <div className={styles.chartsContainerTop}>
            <div className={styles.chartsLeft}>
              <div className={styles.barCharts}>
                <div className={styles.chartTitleWrapper}>
                  <span className={styles.chartTitle}>Top Presets</span>
                  <div className={styles.chartContainer}>
                    <BarChart
                      dataset={topPresetsData}
                      xAxis={[
                        {
                          dataKey: "presetName",
                          scaleType: "band",
                          barGapRatio: 0.1,
                          position: "none",
                        },
                      ]}
                      yAxis={[{ position: "none" }]}
                      series={[{ dataKey: "usageCount", color: "#6366f1" }]}
                      height={100}
                      borderRadius={8}
                      margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                      slotProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: "#171b1f !important",
                            borderRadius: 0.4,
                            opacity: 0.9,
                            color: "#e3e5e4 !important",
                            "& *": {
                              color: "#e3e5e4 !important",
                              backgroundColor: "transparent !important",
                            },
                            "& table": {
                              backgroundColor: "transparent !important",
                              color: "#e3e5e4 !important",
                            },
                            "& td": {
                              color: "#e3e5e4 !important",
                              backgroundColor: "transparent !important",
                            },
                            "& th": {
                              color: "#e3e5e4 !important",
                              backgroundColor: "transparent !important",
                            },
                            "& div": {
                              color: "#e3e5e4 !important",
                            },
                            "& span": {
                              color: "#e3e5e4 !important",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className={styles.chartTitleWrapper}>
                  <span className={styles.chartTitle}>Top Synths</span>
                  <div className={styles.chartContainer}>
                    <BarChart
                      dataset={topSynthsData}
                      xAxis={[
                        {
                          dataKey: "synthName",
                          scaleType: "band",
                          barGapRatio: 0.1,
                          position: "none",
                        },
                      ]}
                      yAxis={[{ position: "none" }]}
                      series={[{ dataKey: "usageCount", color: "#8b5cf6" }]}
                      height={100}
                      borderRadius={8}
                      margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                      slotProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: "#171b1f !important",
                            borderRadius: 0.4,
                            opacity: 0.9,
                            color: "#e3e5e4 !important",
                            "& *": {
                              color: "#e3e5e4 !important",
                              backgroundColor: "transparent !important",
                            },
                            "& table": {
                              backgroundColor: "transparent !important",
                              color: "#e3e5e4 !important",
                            },
                            "& td": {
                              color: "#e3e5e4 !important",
                              backgroundColor: "transparent !important",
                            },
                            "& th": {
                              color: "#e3e5e4 !important",
                              backgroundColor: "transparent !important",
                            },
                            "& div": {
                              color: "#e3e5e4 !important",
                            },
                            "& span": {
                              color: "#e3e5e4 !important",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className={styles.chartTitleWrapper}>
                  <span className={styles.chartTitle}>Top Artists</span>
                  <div className={styles.chartContainer}>
                    <BarChart
                      dataset={topArtistsData}
                      xAxis={[
                        {
                          dataKey: "artistName",
                          scaleType: "band",
                          barGapRatio: 0.1,
                          position: "none",
                        },
                      ]}
                      yAxis={[{ position: "none" }]}
                      series={[{ dataKey: "presetCount", color: "#06b6d4" }]}
                      height={100}
                      borderRadius={8}
                      margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                      slotProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: "#171b1f !important",
                            borderRadius: 0.4,
                            opacity: 0.9,
                            color: "#e3e5e4 !important",
                            "& *": {
                              color: "#e3e5e4 !important",
                              backgroundColor: "transparent !important",
                            },
                            "& table": {
                              backgroundColor: "transparent !important",
                              color: "#e3e5e4 !important",
                            },
                            "& td": {
                              color: "#e3e5e4 !important",
                              backgroundColor: "transparent !important",
                            },
                            "& th": {
                              color: "#e3e5e4 !important",
                              backgroundColor: "transparent !important",
                            },
                            "& div": {
                              color: "#e3e5e4 !important",
                            },
                            "& span": {
                              color: "#e3e5e4 !important",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.chartTitleWrapper}>
                <span className={styles.chartTitle}>
                  Daily Content Activity
                </span>
                <div className={styles.chartContainer}>
                  <LineChart
                    dataset={dailyContentActivityData}
                    xAxis={[
                      {
                        dataKey: "activityDate",
                        scaleType: "point",
                      },
                    ]}
                    yAxis={[{ position: "none" }]}
                    series={[
                      {
                        dataKey: "songActivity",
                        color: "#8884d8",
                      },
                      {
                        dataKey: "artistActivity",
                        color: "#82ca9d",
                      },
                      {
                        dataKey: "synthActivity",
                        color: "#ffc658",
                      },
                      {
                        dataKey: "albumActivity",
                        color: "#ff7c7c",
                      },
                    ]}
                    height={300}
                    sx={{
                      // Hollow dots
                      "& .MuiMarkElement-root, & circle": {
                        fill: "transparent !important",
                      },
                      // Axis colors as backup
                      "& text": {
                        fill: "#2d343a !important",
                      },
                      "& line": {
                        stroke: "#2d343a !important",
                      },
                    }}
                  />
                </div>
              </div>
            </div>
            <div className={styles.chartsRight}>
              <div className={styles.sparkLineCharts}>
                <div className={styles.chartTitleWrapper}>
                  <span className={styles.chartTitle}>
                    Total Database Growth
                  </span>
                  <div className={styles.chartContainer}>
                    <SparkLineChart
                      height={40}
                      area
                      showHighlight
                      color="rgb(137, 86, 255)"
                      data={cumulativeData}
                      xAxis={{ data: dates }}
                      baseline="min"
                      margin={{ bottom: 0, top: 5, left: 4, right: 0 }}
                    />
                  </div>
                </div>

                <div className={styles.chartTitleWrapper}>
                  <span className={styles.chartTitle}>
                    Artist Discovery Rate
                  </span>
                  <div className={styles.chartContainer}>
                    <SparkLineChart
                      height={40}
                      showHighlight
                      color="rgb(34, 197, 94)"
                      data={discoveryData}
                      xAxis={{ data: weeks }}
                      curve="natural"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.chartTitleWrapper}>
                <span className={styles.chartTitle}>Genre Distribution</span>
                <div className={styles.chartContainer}>
                  <PieChart
                    series={[
                      {
                        data: genreDistributionData,
                        valueKey: "value",
                        labelKey: "label",
                      },
                    ]}
                    width={400}
                    height={250}
                  />
                </div>
              </div>

              <div className={styles.chartTitleWrapper}>
                <span className={styles.chartTitle}>
                  Synth Era Distribution
                </span>
                <div className={styles.chartContainer}>
                  <PieChart
                    series={[
                      {
                        data: synthEraDistributionData.map((item, index) => ({
                          id: index,
                          value: item.value,
                          label: item.label,
                        })),
                      },
                    ]}
                    width={400}
                    height={250}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.chartTitleWrapper}>
            <span className={styles.chartTitle}>Weekly Submissions</span>
            <div className={styles.chartContainer}>
              <LineChart
                dataset={weeklySubmissionsData}
                xAxis={[{ dataKey: "weekStart", scaleType: "point" }]}
                series={[{ dataKey: "submissionCount" }]}
                height={300}
              />
            </div>
          </div>
        </div>
      </ContentContainer>
    </>
  );
}
