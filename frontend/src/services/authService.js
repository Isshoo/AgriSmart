import api from './api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  changePassword: async (passwordLama, passwordBaru) => {
    const response = await api.put('/auth/change-password', {
      passwordLama,
      passwordBaru
    });
    return response.data;
  }
};

