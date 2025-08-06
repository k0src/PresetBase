/* ---------------------------------- Songs --------------------------------- */
export async function getSongsData(sort = null, direction = "ASC") {
  const res = await fetch(
    `/api/browse/songs?sort=${sort}&direction=${direction}`
  );
  if (!res.ok) throw new Error("Failed to fetch songs data");
  return res.json();
}

export async function getTotalSongEntries() {
  const res = await fetch("/api/browse/songs/total-entries");
  if (!res.ok) throw new Error("Failed to fetch total song entries");
  return res.json();
}

/* --------------------------------- Artists -------------------------------- */
export async function getArtistsData(sort = null, direction = "ASC") {
  const res = await fetch(
    `/api/browse/artists?sort=${sort}&direction=${direction}`
  );
  if (!res.ok) throw new Error("Failed to fetch artists data");
  return res.json();
}

export async function getTotalArtistEntries() {
  const res = await fetch("/api/browse/artists/total-entries");
  if (!res.ok) throw new Error("Failed to fetch total artist entries");
  return res.json();
}

/* --------------------------------- Albums --------------------------------- */
export async function getAlbumsData(sort = null, direction = "ASC") {
  const res = await fetch(
    `/api/browse/albums?sort=${sort}&direction=${direction}`
  );
  if (!res.ok) throw new Error("Failed to fetch albums data");
  return res.json();
}

export async function getTotalAlbumEntries() {
  const res = await fetch("/api/browse/albums/total-entries");
  if (!res.ok) throw new Error("Failed to fetch total album entries");
  return res.json();
}

/* --------------------------------- Synths --------------------------------- */
export async function getSynthsData(sort = null, direction = "ASC") {
  const res = await fetch(
    `/api/browse/synths?sort=${sort}&direction=${direction}`
  );
  if (!res.ok) throw new Error("Failed to fetch synths data");
  return res.json();
}

export async function getTotalSynthEntries() {
  const res = await fetch("/api/browse/synths/total-entries");
  if (!res.ok) throw new Error("Failed to fetch total synth entries");
  return res.json();
}

/* --------------------------------- Presets -------------------------------- */
export async function getPresetsData(sort = null, direction = "ASC") {
  const res = await fetch(
    `/api/browse/presets?sort=${sort}&direction=${direction}`
  );
  if (!res.ok) throw new Error("Failed to fetch presets data");
  return res.json();
}

export async function getTotalPresetEntries() {
  const res = await fetch("/api/browse/presets/total-entries");
  if (!res.ok) throw new Error("Failed to fetch total preset entries");
  return res.json();
}

/* --------------------------------- Genres --------------------------------- */
