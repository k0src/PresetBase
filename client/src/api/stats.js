import api from "./api";

export const statsAPI = {
  async getTopPresets() {
    const res = await api.get("/stats/top-presets");
    return res.data?.data;
  },

  async getTopSynths() {
    const res = await api.get("/stats/top-synths");
    return res.data?.data;
  },

  async getTopArtists() {
    const res = await api.get("/stats/top-artists");
    return res.data?.data;
  },

  async getWeeklySubmissions() {
    const res = await api.get("/stats/weekly-submissions");
    return res.data?.data;
  },

  async getDailyContentActivity() {
    const res = await api.get("/stats/daily-content-activity");
    return res.data?.data;
  },

  async getGenreDistribution() {
    const res = await api.get("/stats/genre-distribution");
    return res.data?.data;
  },

  async getCumulativeSubmissions() {
    const res = await api.get("/stats/cumulative-submissions");
    return res.data?.data;
  },

  async getSynthEraDistribution() {
    const res = await api.get("/stats/synth-era-distribution");
    return res.data?.data;
  },

  async getWeeklyDiscoveryRate() {
    const res = await api.get("/stats/weekly-discovery-rate");
    return res.data?.data;
  },

  async getDeepCuts() {
    const res = await api.get("/stats/deep-cuts");
    return res.data?.data;
  },

  async getSongOfMonth() {
    const res = await api.get("/stats/top-song-monthly");
    return res.data?.data;
  },
};
