import { useState, useEffect } from "react";

export function useStatsData() {
  const [totalEntries, setTotalEntries] = useState(null);
  const [topPresets, setTopPresets] = useState(null);
  const [presetsPerSynth, setPresetsPerSynth] = useState(null);
  const [topSynths, setTopSynths] = useState(null);
  const [synthTimeData, setSynthTimeData] = useState(null);
  const [communityStats, setCommunityStats] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [currentYear, setCurrentYear] = useState(2025);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { getTotalEntries } = await import("../api/api");
        const {
          getTopPresetsData,
          getPresetsPerSynthData,
          getTopSynthsData,
          getSynthTimeData,
          getCommunityStats,
          getHeatmapData,
        } = await import("../api/stats");

        const [
          totalEntriesData,
          topPresetsResult,
          presetsPerSynthResult,
          topSynthsResult,
          synthTimeResult,
          communityStatsResult,
          heatmapResult,
        ] = await Promise.all([
          getTotalEntries(),
          getTopPresetsData(),
          getPresetsPerSynthData(),
          getTopSynthsData(),
          getSynthTimeData(),
          getCommunityStats(),
          getHeatmapData(),
        ]);

        setTotalEntries(totalEntriesData.data);
        setTopPresets(topPresetsResult);
        setPresetsPerSynth(presetsPerSynthResult);
        setTopSynths(topSynthsResult);
        setSynthTimeData(synthTimeResult);
        setCommunityStats(communityStatsResult);
        setHeatmapData(heatmapResult);
      } catch (err) {
        console.error("Error fetching stats data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const refetchHeatmapData = async (year) => {
    try {
      const { getHeatmapData } = await import("../api/stats");
      const result = await getHeatmapData();
      setHeatmapData(result);
      setCurrentYear(year);
    } catch (err) {
      console.error("Error refetching heatmap data:", err);
      setError(err.message);
    }
  };

  return {
    data: {
      totalEntries,
      topPresets,
      presetsPerSynth,
      topSynths,
      synthTimeData,
      communityStats,
      heatmapData,
      currentYear,
    },
    loading,
    error,
    refetchHeatmapData,
  };
}
