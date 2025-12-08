import api from './api';

export const kelompokTaniService = {
  getAll: async (params = {}) => {
    const response = await api.get('/kelompok-tani', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/kelompok-tani/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/kelompok-tani', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/kelompok-tani/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/kelompok-tani/${id}`);
    return response.data;
  },
  uploadDocument: async (id, document) => {
    const formData = new FormData();
    formData.append('document', document);
    const response = await api.post(`/kelompok-tani/upload/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

