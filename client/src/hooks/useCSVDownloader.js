import { useState, useCallback } from "react";
import { dbEntryConfigs } from "../components/Admin/ManageDb/dbEntryConfigs";
import { browseAPI } from "../api/browse";

const dataFetchers = {
  songs: browseAPI.getSongs,
  artists: browseAPI.getArtists,
  albums: browseAPI.getAlbums,
  synths: browseAPI.getSynths,
  presets: browseAPI.getPresets,
};

export function useCSVDownloader(
  entryType,
  sortBy = "added",
  sortDirection = "asc"
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const generateCSVData = useCallback((tableData, config) => {
    const headers = config.columns.map((col) => col.label);
    const rows = tableData.map((item) =>
      config.columns
        .map((col) => {
          let value = item[col.key];
          if (value === null || value === undefined) value = "";
          return `"${value.toString().replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  }, []);

  const downloadCSVData = useCallback(
    (csvData) => {
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${entryType}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [entryType]
  );

  const download = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const fetchData = dataFetchers[entryType];
      if (!fetchData) throw new Error("Invalid entry type");

      const tableData = await fetchData(sortBy, sortDirection);

      const config = dbEntryConfigs[entryType];
      const csvData = generateCSVData(tableData, config);
      downloadCSVData(csvData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [entryType, sortBy, sortDirection, generateCSVData, downloadCSVData]);

  return { loading, error, download };
}
