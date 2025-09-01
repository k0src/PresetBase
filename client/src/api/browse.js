import api from "./api";

export const browseAPI = {
  // Songs
  async getSongs(sort = null, direction = "ASC", limit = null) {
    const response = await api.get("/browse/songs", {
      params: { sort, direction, limit },
    });
    return response.data;
  },

  async getTotalSongEntries() {
    const response = await api.get("/browse/songs/total-entries");
    return response.data;
  },

  // Popular, Hot, Recent
  async getPopularSongs(sort = null, direction = "DESC", limit = null) {
    const response = await api.get("/browse/songs/popular", {
      params: { sort, direction, limit },
    });
    return response.data;
  },

  async getHotSongs(sort = null, direction = "DESC", limit = null) {
    const response = await api.get("/browse/songs/hot", {
      params: { sort, direction, limit },
    });
    return response.data;
  },

  async getRecentSongs(sort = null, direction = "DESC", limit = null) {
    const response = await api.get("/browse/songs/recent", {
      params: { sort, direction, limit },
    });
    return response.data;
  },

  // Artists
  async getArtists(sort = null, direction = "ASC") {
    const response = await api.get("/browse/artists", {
      params: { sort, direction },
    });
    return response.data;
  },

  async getTotalArtistEntries() {
    const response = await api.get("/browse/artists/total-entries");
    return response.data;
  },

  // Albums
  async getAlbums(sort = null, direction = "ASC") {
    const response = await api.get("/browse/albums", {
      params: { sort, direction },
    });
    return response.data;
  },

  async getTotalAlbumEntries() {
    const response = await api.get("/browse/albums/total-entries");
    return response.data;
  },

  // Synths
  async getSynths(sort = null, direction = "ASC") {
    const response = await api.get("/browse/synths", {
      params: { sort, direction },
    });
    return response.data;
  },

  async getTotalSynthEntries() {
    const response = await api.get("/browse/synths/total-entries");
    return response.data;
  },

  // Presets
  async getPresets(sort = null, direction = "ASC") {
    const response = await api.get("/browse/presets", {
      params: { sort, direction },
    });
    return response.data;
  },

  async getTotalPresetEntries() {
    const response = await api.get("/browse/presets/total-entries");
    return response.data;
  },

  // Genres
  async getGenres(sort = null, direction = "ASC") {
    const response = await api.get("/browse/genres", {
      params: { sort, direction },
    });
    return response.data;
  },

  async getTotalGenreEntries() {
    const response = await api.get("/browse/genres/total-entries");
    return response.data;
  },
};
