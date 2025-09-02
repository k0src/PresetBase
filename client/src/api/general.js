import api from "./api";

export const generalAPI = {
  async searchDatabase(query) {
    const res = await api.get("/search", {
      params: { query },
    });
    return res.data?.data;
  },

  async getTotalEntries() {
    const res = await api.get("/total-entries");
    return res.data?.data;
  },

  async getNumberEntries() {
    const res = await api.get("/number-entries");
    return res.data?.data;
  },

  async getLatestEntry() {
    const res = await api.get("/latest-entry");
    return res.data?.data;
  },

  async getEntryNames(query, limit) {
    const res = await api.get("/entry-names", {
      params: { query, limit },
    });
    return res.data?.data;
  },

  async submitData(data) {
    const config = {};
    if (data instanceof FormData) {
      config.headers = {
        "Content-Type": "multipart/form-data",
      };
    }

    const res = await api.post("/submit", data, config);
    return res.data;
  },

  async getAutofillSuggestions(type, query, limit = 5) {
    const res = await api.get(
      `/autofill/suggestions/${encodeURIComponent(type)}`,
      {
        params: { query, limit },
      }
    );
    return res.data?.data;
  },

  async getAutofillData(type, query) {
    const res = await api.get(`/autofill/data/${encodeURIComponent(type)}`, {
      params: { query },
    });
    return res.data?.data;
  },
};
