import api from "./api";

export async function getPendingSubmissions() {
  const res = await api.get("/admin/pending-submissions");
  return res.data;
}

export async function approveSubmission(submission) {
  const res = await api.post("/admin/approve-submission", submission);
  return res.data;
}

export async function denySubmission(submissionId) {
  const res = await api.post("/admin/deny-submission", { submissionId });
  return res.data;
}

export async function uploadEntry(data) {
  const res = await api.post("/admin/upload", data);
  return res.data;
}

export async function getEntryData(table, id) {
  const res = await api.get(`/admin/entry/${table}/${id}`);
  return res.data;
}

export async function updateEntry(table, id, data) {
  const res = await api.put(`/admin/entry/${table}/${id}`, data);
  return res.data;
}

export async function deleteEntry(table, id) {
  const res = await api.delete(`/admin/entry/${table}/${id}`);
  return res.data;
}

export async function getFieldData(table, query = "", limit = 10) {
  const res = await api.get(
    `/admin/field-data/${table}?query=${encodeURIComponent(
      query
    )}&limit=${limit}`
  );
  return res.data;
}
