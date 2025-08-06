/* ---------------------------------- Songs --------------------------------- */
export async function getSongsData(sort = null, direction = "ASC") {
  const res = await fetch(
    `/api/browse/songs?sort=${sort}&direction=${direction}`
  );
  if (!res.ok) throw new Error("Failed to fetch songs data");
  return res.json();
}

export async function getTotalEntries() {
  const res = await fetch("/api/browse/songs/total-entries");
  if (!res.ok) throw new Error("Failed to fetch total song entries");
  return res.json();
}
