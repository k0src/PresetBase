import api from "./api";

export const entryAPI = {
  // Song functions
  async getSong(id) {
    const res = await api.get(`/song/${id}`);
    return res.data?.data;
  },

  async getRelatedSongs(id, limit = null) {
    const res = await api.get(`/song/${id}/related`, {
      params: { limit },
    });
    return res.data?.data;
  },

  // Album functions
  async getAlbum(id) {
    const res = await api.get(`/album/${id}`);
    return res.data?.data;
  },

  async getRelatedAlbums(id, limit = null) {
    const res = await api.get(`/album/${id}/related`, {
      params: { limit },
    });
    return res.data?.data;
  },

  // Artist functions
  async getArtist(id) {
    const res = await api.get(`/artist/${id}`);
    return res.data?.data;
  },

  async getArtistTotalSongs(id) {
    const res = await api.get(`/artist/${id}/total-songs`);
    return res.data?.data;
  },

  async getArtistAlbums(id, limit) {
    const res = await api.get(`/artist/${id}/albums`, {
      params: { limit },
    });
    return res.data?.data;
  },

  async getArtistFavoriteSynth(id) {
    const res = await api.get(`/artist/${id}/favorite-synth`);
    return res.data?.data;
  },

  // Synth functions
  async getSynth(id) {
    const res = await api.get(`/synth/${id}`);
    return res.data?.data;
  },

  async getRelatedSynths(id, limit = null) {
    const res = await api.get(`/synth/${id}/related`, {
      params: { limit },
    });
    return res.data?.data;
  },
};
