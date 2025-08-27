import { useMemo, useCallback, useState } from "react";
import { useAsyncData } from "./useAsyncData";
import {
  getSongsData,
  getArtistsData,
  getAlbumsData,
  getSynthsData,
  getPresetsData,
  getGenresData,
  getTotalSongEntries,
  getTotalArtistEntries,
  getTotalAlbumEntries,
  getTotalSynthEntries,
  getTotalPresetEntries,
  getTotalGenreEntries,
} from "../api/browse";

const dataFetchers = {
  songs: {
    data: getSongsData,
    total: getTotalSongEntries,
  },
  artists: {
    data: getArtistsData,
    total: getTotalArtistEntries,
  },
  albums: {
    data: getAlbumsData,
    total: getTotalAlbumEntries,
  },
  synths: {
    data: getSynthsData,
    total: getTotalSynthEntries,
  },
  presets: {
    data: getPresetsData,
    total: getTotalPresetEntries,
  },
  genres: {
    data: getGenresData,
    total: getTotalGenreEntries,
  },
};

export function useAdminTableData(selectedTable, sortBy, sortDirection) {
  const [tableRefreshKey, setTableRefreshKey] = useState(0);

  const fetchConfig = useMemo(() => {
    const fetchers = dataFetchers[selectedTable];
    if (!fetchers) return {};
    return {
      data: () => fetchers.data(sortBy, sortDirection),
      total: () => fetchers.total(),
    };
  }, [selectedTable, sortBy, sortDirection]);

  const { data, loading, error } = useAsyncData(
    fetchConfig,
    [selectedTable, sortBy, sortDirection, tableRefreshKey],
    {
      cacheKey: `adminManageDb-${selectedTable}-${sortBy}-${sortDirection}`,
      resetOnDepsChange: true,
    }
  );

  const refreshTableData = useCallback(() => {
    setTableRefreshKey((prev) => prev + 1);
  }, []);

  return {
    tableData: data.data?.data || null,
    totalEntries: data.total?.data || null,
    loading,
    error,
    refreshTableData,
  };
}
