export async function getTotalEntries() {
  const res = await fetch("/api/total-entries");
  if (!res.ok) throw new Error("Failed to fetch total entries");
  return res.json();
}
