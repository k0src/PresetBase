export async function getArtistById(id) {
  const res = await fetch(`/api/artist/${id}`);
  if (!res.ok) throw new Error("Failed to fetch artist");
  return res.json();
}

export async function getTotalSongs(id) {
  const res = await fetch(`/api/artist/${id}/total-songs`);
  if (!res.ok) throw new Error("Failed to fetch total songs");
  return res.json();
}

export async function getAlbums(id, limit) {
  const res = await fetch(`/api/artist/${id}/albums?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch albums");
  return res.json();
}

export async function getFavoriteSynth(id) {
  const res = await fetch(`/api/artist/${id}/favorite-synth`);
  if (!res.ok) throw new Error("Failed to fetch favorite synth");
  return res.json();
}
