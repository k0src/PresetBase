import api from "./api";

export const statsAPI = {
  async getTopPresets() {
    const res = await api.get("/stats/top-presets");
    return res.data;
  },

  async getPresetsPerSynth() {
    const res = await api.get("/stats/presets-per-synth");
    return res.data;
  },

  async getTopSynths() {
    const res = await api.get("/stats/top-synths");
    return res.data;
  },

  async getSynthTimeData() {
    const res = await api.get("/stats/synth-time-data");
    return res.data;
  },

  async getHeatmapData() {
    const res = await api.get("/stats/heatmap-data");
    return res.data;
  },

  async getCommunityStats() {
    const res = await api.get("/stats/community-stats");
    return res.data;
  },
};
