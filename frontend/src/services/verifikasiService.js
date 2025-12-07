import api from './api';

export const verifikasiService = {
  getPending: async (params = {}) => {
    const response = await api.get('/verifikasi/pending', { params });
    return response.data;
  },
  verify: async (id, status, catatan) => {
    const response = await api.put(`/verifikasi/${id}`, { status, catatan });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/verifikasi/stats');
    return response.data;
  }
};

