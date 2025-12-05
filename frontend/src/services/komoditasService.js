import api from './api';

export const komoditasService = {
  getAll: async (params = {}) => {
    const response = await api.get('/komoditas', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/komoditas/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/komoditas', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/komoditas/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/komoditas/${id}`);
    return response.data;
  }
};

