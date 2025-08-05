export async function getTotalEntries() {
  const res = await fetch("/api/total-entries");
  if (!res.ok) throw new Error("Failed to fetch total entries");
  return res.json();
}

export async function searchDatabase(query) {
  const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search database");
  return res.json();
}
