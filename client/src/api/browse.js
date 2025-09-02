import api from "./api";

export const browseAPI = {
  // Songs
  async getSongs(sort = null, direction = "ASC", limit = null) {
    const res = await api.get("/browse/songs", {
      params: { sort, direction, limit },
    });
    return res.data?.data;
  },

  async getTotalSongEntries() {
    const res = await api.get("/browse/songs/total-entries");
    return res.data?.data;
  },

  // Popular, Hot, Recent
  async getPopularSongs(sort = null, direction = "DESC", limit = null) {
    const res = await api.get("/browse/songs/popular", {
      params: { sort, direction, limit },
    });
    return res.data?.data;
  },

  async getHotSongs(sort = null, direction = "DESC", limit = null) {
    const res = await api.get("/browse/songs/hot", {
      params: { sort, direction, limit },
    });
    return res.data?.data;
  },

  async getRecentSongs(sort = null, direction = "DESC", limit = null) {
    const res = await api.get("/browse/songs/recent", {
      params: { sort, direction, limit },
    });
    return res.data?.data;
  },

  // Artists
  async getArtists(sort = null, direction = "ASC") {
    const res = await api.get("/browse/artists", {
      params: { sort, direction },
    });
    return res.data?.data;
  },

  async getTotalArtistEntries() {
    const res = await api.get("/browse/artists/total-entries");
    return res.data?.data;
  },

  // Albums
  async getAlbums(sort = null, direction = "ASC") {
    const res = await api.get("/browse/albums", {
      params: { sort, direction },
    });
    return res.data?.data;
  },

  async getTotalAlbumEntries() {
    const res = await api.get("/browse/albums/total-entries");
    return res.data?.data;
  },

  // Synths
  async getSynths(sort = null, direction = "ASC") {
    const res = await api.get("/browse/synths", {
      params: { sort, direction },
    });
    return res.data?.data;
  },

  async getTotalSynthEntries() {
    const res = await api.get("/browse/synths/total-entries");
    return res.data?.data;
  },

  async getTopSynths(limit = null) {
    const res = await api.get("/browse/synths/top", {
      params: { limit },
    });
    return res.data?.data;
  },

  // Presets
  async getPresets(sort = null, direction = "ASC") {
    const res = await api.get("/browse/presets", {
      params: { sort, direction },
    });
    return res.data?.data;
  },

  async getTotalPresetEntries() {
    const res = await api.get("/browse/presets/total-entries");
    return res.data?.data;
  },

  async getTopPresets(limit = null) {
    const res = await api.get("/browse/presets/top", {
      params: { limit },
    });
    return res.data?.data;
  },

  // Genres
  async getGenres(sort = null, direction = "ASC") {
    const res = await api.get("/browse/genres", {
      params: { sort, direction },
    });
    return res.data?.data;
  },

  async getTotalGenreEntries() {
    const res = await api.get("/browse/genres/total-entries");
    return res.data?.data;
  },

  async getTopGenres(limit = null) {
    const res = await api.get("/browse/genres/top", {
      params: { limit },
    });
    return res.data?.data;
  },
};
