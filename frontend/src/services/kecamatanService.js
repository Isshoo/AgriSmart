import api from './api';

export const kecamatanService = {
  getAll: async () => {
    const response = await api.get('/kecamatan');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/kecamatan', data);
    return response.data;
  }
};

