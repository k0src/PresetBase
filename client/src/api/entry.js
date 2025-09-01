import api from "./api";

export const entryAPI = {
  // Song functions
  async getSong(id) {
    const response = await api.get(`/song/${id}`);
    return response.data;
  },

  async getRelatedSongs(id, limit = null) {
    const response = await api.get(`/song/${id}/related`, {
      params: { limit },
    });
    return response.data;
  },

  // Album functions
  async getAlbum(id) {
    const response = await api.get(`/album/${id}`);
    return response.data;
  },

  async getRelatedAlbums(id, limit = null) {
    const response = await api.get(`/album/${id}/related`, {
      params: { limit },
    });
    return response.data;
  },

  // Artist functions
  async getArtist(id) {
    const response = await api.get(`/artist/${id}`);
    return response.data;
  },

  async getArtistTotalSongs(id) {
    const response = await api.get(`/artist/${id}/total-songs`);
    return response.data;
  },

  async getArtistAlbums(id, limit) {
    const response = await api.get(`/artist/${id}/albums`, {
      params: { limit },
    });
    return response.data;
  },

  async getArtistFavoriteSynth(id) {
    const response = await api.get(`/artist/${id}/favorite-synth`);
    return response.data;
  },

  // Synth functions
  async getSynth(id) {
    const response = await api.get(`/synth/${id}`);
    return response.data;
  },

  async getRelatedSynths(id, limit = null) {
    const response = await api.get(`/synth/${id}/related`, {
      params: { limit },
    });
    return response.data;
  },
};
