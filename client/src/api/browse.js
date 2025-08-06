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

/* --------------------------------- Presets -------------------------------- */

/* --------------------------------- Genres --------------------------------- */
