export async function getTopPresetsData() {
  const res = await fetch("/api/stats/top-presets");
  if (!res.ok) throw new Error("Failed to fetch top presets data");
  return res.json();
}

export async function getPresetsPerSynthData() {
  const res = await fetch("/api/stats/presets-per-synth");
  if (!res.ok) throw new Error("Failed to fetch presets per synth data");
  return res.json();
}

export async function getTopSynthsData() {
  const res = await fetch("/api/stats/top-synths");
  if (!res.ok) throw new Error("Failed to fetch top synths data");
  return res.json();
}

export async function getSynthTimeData() {
  const res = await fetch("/api/stats/synth-time-data");
  if (!res.ok) throw new Error("Failed to fetch synth time data");
  return res.json();
}

export async function getHeatmapData() {
  const res = await fetch("/api/stats/heatmap-data");
  if (!res.ok) throw new Error("Failed to fetch heatmap data");
  return res.json();
}

export async function getCommunityStats() {
  const res = await fetch("/api/stats/community-stats");
  if (!res.ok) throw new Error("Failed to fetch community stats");
  return res.json();
}
