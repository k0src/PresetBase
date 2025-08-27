export async function getPendingSubmissions() {
  const res = await fetch("/api/admin/pending-submissions");
  if (!res.ok) throw new Error("Failed to fetch pending submissions");
  return res.json();
}

export async function approveSubmission(submission) {
  const res = await fetch("/api/admin/approve-submission", {
    method: "POST",
    body: submission,
  });
  if (!res.ok) throw new Error("Failed to approve submission");
  return res.json();
}

export async function denySubmission(submissionId) {
  const res = await fetch("/api/admin/deny-submission", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ submissionId }),
  });
  if (!res.ok) throw new Error("Failed to deny submission");
  return res.json();
}

export async function uploadEntry(data) {
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: data,
  });
  if (!res.ok) throw new Error("Failed to upload entry");
  return res.json();
}

export async function getEntryData(table, id) {
  const res = await fetch(`/api/admin/entry/${table}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch entry data");
  return res.json();
}

export async function updateEntry(table, id, data) {
  const res = await fetch(`/api/admin/entry/${table}/${id}`, {
    method: "PUT",
    body: data,
  });
  if (!res.ok) throw new Error("Failed to update entry");
  return res.json();
}

export async function deleteEntry(table, id) {
  const res = await fetch(`/api/admin/entry/${table}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete entry");
  return res.json();
}

export async function getFieldData(table, query = "", limit = 10) {
  const res = await fetch(
    `/api/admin/field-data/${table}?query=${encodeURIComponent(
      query
    )}&limit=${limit}`
  );
  if (!res.ok) throw new Error("Failed to fetch field data");
  return res.json();
}
