import api from "./api";

export const statsAPI = {
  async getTopPresets() {
    const response = await api.get("/stats/top-presets");
    return response.data;
  },

  async getPresetsPerSynth() {
    const response = await api.get("/stats/presets-per-synth");
    return response.data;
  },

  async getTopSynths() {
    const response = await api.get("/stats/top-synths");
    return response.data;
  },

  async getSynthTimeData() {
    const response = await api.get("/stats/synth-time-data");
    return response.data;
  },

  async getHeatmapData() {
    const response = await api.get("/stats/heatmap-data");
    return response.data;
  },

  async getCommunityStats() {
    const response = await api.get("/stats/community-stats");
    return response.data;
  },
};
