import { useMemo, useCallback } from "react";
import { useAsyncData } from "./useAsyncData";
import { browseAPI } from "../api/browse";

const dataFetchers = {
  songs: {
    data: browseAPI.getSongs,
    total: browseAPI.getTotalSongEntries,
  },
  artists: {
    data: browseAPI.getArtists,
    total: browseAPI.getTotalArtistEntries,
  },
  albums: {
    data: browseAPI.getAlbums,
    total: browseAPI.getTotalAlbumEntries,
  },
  synths: {
    data: browseAPI.getSynths,
    total: browseAPI.getTotalSynthEntries,
  },
  presets: {
    data: browseAPI.getPresets,
    total: browseAPI.getTotalPresetEntries,
  },
  genres: {
    data: browseAPI.getGenres,
    total: browseAPI.getTotalGenreEntries,
  },
};

export function useAdminTableData(selectedTable, sortBy, sortDirection) {
  const fetchConfig = useMemo(() => {
    const fetchers = dataFetchers[selectedTable];
    if (!fetchers) return {};
    return {
      data: () => fetchers.data(sortBy, sortDirection),
      total: () => fetchers.total(),
    };
  }, [selectedTable, sortBy, sortDirection]);

  const { data, loading, error, refetch } = useAsyncData(
    fetchConfig,
    [selectedTable, sortBy, sortDirection],
    {
      cacheKey: `adminManageDb-${selectedTable}-${sortBy}-${sortDirection}`,
      resetOnDepsChange: true,
    }
  );

  const refreshTableData = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    tableData: data.data?.data || null,
    totalEntries: data.total?.data || null,
    loading,
    error,
    refreshTableData,
  };
}
