import express from 'express';
import {
  getAllKelompokTani,
  getKelompokTaniById,
  createKelompokTani,
  updateKelompokTani,
  deleteKelompokTani
} from '../controllers/kelompokTani.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { roleGuard } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all kelompok tani - accessible by all roles
router.get('/', getAllKelompokTani);

// Get kelompok tani by id - accessible by all roles
router.get('/:id', getKelompokTaniById);

// Create, update, delete - only Penyuluh and Admin
router.post('/', roleGuard('PENYULUH', 'ADMIN'), createKelompokTani);
router.put('/:id', roleGuard('PENYULUH', 'ADMIN'), updateKelompokTani);
router.delete('/:id', roleGuard('ADMIN'), deleteKelompokTani);

export default router;

