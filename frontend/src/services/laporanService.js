import api from './api';

export const laporanService = {
  getDashboardStats: async () => {
    const response = await api.get('/laporan/dashboard');
    return response.data;
  },
  getLaporanPetani: async () => {
    const response = await api.get('/laporan/petani');
    return response.data;
  },
  getLaporanKelompokTani: async () => {
    const response = await api.get('/laporan/kelompok-tani');
    return response.data;
  },
  getLaporanKomoditas: async () => {
    const response = await api.get('/laporan/komoditas');
    return response.data;
  },
  exportExcel: async (type) => {
    const response = await api.get('/laporan/export/excel', {
      params: { type },
      responseType: 'blob'
    });
    return response.data;
  },
  exportPDF: async (type) => {
    const response = await api.get('/laporan/export/pdf', {
      params: { type }
    });
    return response.data;
  }
};

