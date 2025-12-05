import api from './api';

export const petaniService = {
  getAll: async (params = {}) => {
    const response = await api.get('/petani', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/petani/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/petani', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/petani/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/petani/${id}`);
    return response.data;
  }
};

