import api from "./api";

export const adminAPI = {
  async getPendingSubmissions() {
    const res = await api.get("/admin/pending-submissions");
    return res.data?.data;
  },

  async approveSubmission(submission) {
    const config = {};
    if (submission instanceof FormData) {
      config.headers = {
        "Content-Type": "multipart/form-data",
      };
    }

    const res = await api.post("/admin/approve-submission", submission, config);
    return res.data;
  },

  async denySubmission(submissionId) {
    const res = await api.post("/admin/deny-submission", { submissionId });
    return res.data;
  },

  async uploadEntry(data) {
    const config = {};
    if (data instanceof FormData) {
      config.headers = {
        "Content-Type": "multipart/form-data",
      };
    }

    const res = await api.post("/admin/upload", data, config);
    return res.data;
  },

  async getEntryData(table, id) {
    const res = await api.get(`/admin/entry/${table}/${id}`);
    return res.data?.data;
  },

  async updateEntry(table, id, data) {
    const config = {};
    if (data instanceof FormData) {
      config.headers = {
        "Content-Type": "multipart/form-data",
      };
    }

    const res = await api.put(`/admin/entry/${table}/${id}`, data, config);
    return res.data;
  },

  async deleteEntry(table, id) {
    const res = await api.delete(`/admin/entry/${table}/${id}`);
    return res.data;
  },

  async getFieldData(table, query = "", limit = 10) {
    const res = await api.get(`/admin/field-data/${table}`, {
      params: { query, limit },
    });
    return res.data?.data;
  },

  async getUsers(sort = null, direction = "ASC", limit = null) {
    const res = await api.get("/admin/users", {
      params: { sort, direction, limit },
    });
    return res.data?.data;
  },
};
