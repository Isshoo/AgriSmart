import express from 'express';
import {
  getAllKomoditas,
  getKomoditasById,
  createKomoditas,
  updateKomoditas,
  deleteKomoditas
} from '../controllers/komoditas.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { roleGuard } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all komoditas - accessible by all roles
router.get('/', getAllKomoditas);

// Get komoditas by id - accessible by all roles
router.get('/:id', getKomoditasById);

// Create, update, delete - only Penyuluh and Admin
router.post('/', roleGuard('PENYULUH', 'ADMIN'), createKomoditas);
router.put('/:id', roleGuard('PENYULUH', 'ADMIN'), updateKomoditas);
router.delete('/:id', roleGuard('ADMIN'), deleteKomoditas);

export default router;

