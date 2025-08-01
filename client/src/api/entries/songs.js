export async function getSongById(id) {
  const res = await fetch(`/api/song/${id}`);
  if (!res.ok) throw new Error("Failed to fetch song");
  return res.json();
}

export async function getRelatedSongs(id, limit = null) {
  const res = await fetch(`/api/song/${id}/related?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch related songs");
  return res.json();
}
