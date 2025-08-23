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
