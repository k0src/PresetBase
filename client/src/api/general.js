import api from "./api";

export const generalAPI = {
  async getTotalEntries() {
    const response = await api.get("/total-entries");
    return response.data;
  },

  async getNumberEntries() {
    const response = await api.get("/number-entries");
    return response.data;
  },

  async searchDatabase(query) {
    const response = await api.get("/search", {
      params: { query },
    });
    return response.data;
  },

  async submitData(data) {
    const config = {};
    if (data instanceof FormData) {
      config.headers = {
        "Content-Type": "multipart/form-data",
      };
    }

    const response = await api.post("/submit", data, config);
    return response.data;
  },

  async getAutofillSuggestions(type, query, limit = 5) {
    const response = await api.get(
      `/autofill/suggestions/${encodeURIComponent(type)}`,
      {
        params: { query, limit },
      }
    );
    return response.data;
  },

  async getAutofillData(type, query) {
    const response = await api.get(
      `/autofill/data/${encodeURIComponent(type)}`,
      {
        params: { query },
      }
    );
    return response.data;
  },

  async getLatestEntry() {
    const response = await api.get("/latest-entry");
    return response.data;
  },

  async getTopGenres(limit = null) {
    const response = await api.get("/top-genres", {
      params: { limit },
    });
    return response.data;
  },

  async getTopSynths(limit = null) {
    const response = await api.get("/top-synths", {
      params: { limit },
    });
    return response.data;
  },

  async getTopPresets(limit = null) {
    const response = await api.get("/top-presets", {
      params: { limit },
    });
    return response.data;
  },
};
