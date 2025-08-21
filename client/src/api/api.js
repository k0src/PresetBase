export async function getTotalEntries() {
  const res = await fetch("/api/total-entries");
  if (!res.ok) throw new Error("Failed to fetch total entries");
  return res.json();
}

export async function getNumberEntries() {
  const res = await fetch("/api/number-entries");
  if (!res.ok) throw new Error("Failed to fetch total number of entries");
  return res.json();
}

export async function searchDatabase(query) {
  const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search database");
  return res.json();
}

export async function submitData(data) {
  const res = await fetch("/api/submit", {
    method: "POST",
    body: data,
  });
  if (!res.ok) throw new Error("Failed to submit data");
  return res.json();
}

export async function getAutofillSuggestions(type, query, limit = 5) {
  const res = await fetch(
    `/api/autofill/suggestions/${encodeURIComponent(
      type
    )}?query=${encodeURIComponent(query)}&limit=${limit}`
  );
  if (!res.ok) throw new Error("Failed to fetch autofill suggestions");
  return res.json();
}

export async function getAutofillData(type, query) {
  const res = await fetch(
    `/api/autofill/data/${encodeURIComponent(type)}?query=${encodeURIComponent(
      query
    )}`
  );
  if (!res.ok) throw new Error("Failed to fetch autofill data");
  return res.json();
}
