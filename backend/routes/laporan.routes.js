import express from 'express';
import {
  getDashboardStats,
  getLaporanPetani,
  getLaporanKelompokTani,
  getLaporanKomoditas,
  exportExcel,
  exportPDF
} from '../controllers/laporan.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { roleGuard } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Dashboard stats - accessible by all roles
router.get('/dashboard', getDashboardStats);

// Laporan - accessible by Kepala Bidang and Kepala Dinas
router.get('/petani', roleGuard('KEPALA_BIDANG', 'KEPALA_DINAS', 'ADMIN'), getLaporanPetani);
router.get('/kelompok-tani', roleGuard('KEPALA_BIDANG', 'KEPALA_DINAS', 'ADMIN'), getLaporanKelompokTani);
router.get('/komoditas', roleGuard('KEPALA_BIDANG', 'KEPALA_DINAS', 'ADMIN'), getLaporanKomoditas);

// Export - accessible by Kepala Bidang and Kepala Dinas
router.get('/export/excel', roleGuard('KEPALA_BIDANG', 'KEPALA_DINAS', 'ADMIN'), exportExcel);
router.get('/export/pdf', roleGuard('KEPALA_BIDANG', 'KEPALA_DINAS', 'ADMIN'), exportPDF);

export default router;

