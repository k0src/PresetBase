export async function getSynthById(id) {
  const res = await fetch(`/api/synth/${id}`);
  if (!res.ok) throw new Error("Failed to fetch synth");
  return res.json();
}

export async function getRelatedSynths(id, limit = null) {
  const res = await fetch(`/api/synth/${id}/related?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch related synths");
  return res.json();
}
