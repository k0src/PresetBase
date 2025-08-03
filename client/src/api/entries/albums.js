export async function getAlbumById(id) {
  const res = await fetch(`/api/album/${id}`);
  if (!res.ok) throw new Error("Failed to fetch album");
  return res.json();
}

export async function getRelatedAlbums(id, limit = null) {
  const res = await fetch(`/api/album/${id}/related?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch related albums");
  return res.json();
}
