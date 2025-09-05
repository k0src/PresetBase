// import { useState, useEffect } from "react";
// import { generalAPI } from "../api/general";
// import { statsAPI } from "../api/stats";

// export function useStatsData() {
//   const [totalEntries, setTotalEntries] = useState(null);
//   const [topPresets, setTopPresets] = useState(null);
//   const [presetsPerSynth, setPresetsPerSynth] = useState(null);
//   const [topSynths, setTopSynths] = useState(null);
//   const [synthTimeData, setSynthTimeData] = useState(null);
//   const [communityStats, setCommunityStats] = useState(null);
//   const [heatmapData, setHeatmapData] = useState(null);
//   const [currentYear, setCurrentYear] = useState(2025);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchAllData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const [
//           totalEntriesData,
//           topPresetsResult,
//           presetsPerSynthResult,
//           topSynthsResult,
//           synthTimeResult,
//           communityStatsResult,
//           heatmapResult,
//         ] = await Promise.all([
//           generalAPI.getTotalEntries(),
//           statsAPI.getTopPresets(),
//           statsAPI.getPresetsPerSynth(),
//           statsAPI.getTopSynths(),
//           statsAPI.getSynthTimeData(),
//           statsAPI.getCommunityStats(),
//           statsAPI.getHeatmapData(),
//         ]);

//         setTotalEntries(totalEntriesData);
//         setTopPresets(topPresetsResult);
//         setPresetsPerSynth(presetsPerSynthResult);
//         setTopSynths(topSynthsResult);
//         setSynthTimeData(synthTimeResult);
//         setCommunityStats(communityStatsResult);
//         setHeatmapData(heatmapResult);
//       } catch (err) {
//         console.error("Error fetching stats data:", err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllData();
//   }, []);

//   const refetchHeatmapData = async (year) => {
//     try {
//       const { statsAPI } = await import("../api/stats");
//       const result = await statsAPI.getHeatmapData();
//       setHeatmapData(result);
//       setCurrentYear(year);
//     } catch (err) {
//       console.error("Error refetching heatmap data:", err);
//       setError(err.message);
//     }
//   };

//   return {
//     data: {
//       totalEntries,
//       topPresets,
//       presetsPerSynth,
//       topSynths,
//       synthTimeData,
//       communityStats,
//       heatmapData,
//       currentYear,
//     },
//     loading,
//     error,
//     refetchHeatmapData,
//   };
// }
