import express from 'express';
import {
  getPendingKelompokTani,
  verifyKelompokTani,
  getKelompokTaniStats
} from '../controllers/verifikasi.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { roleGuard } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get pending kelompok tani - only Admin
router.get('/pending', roleGuard('ADMIN'), getPendingKelompokTani);

// Verify kelompok tani - only Admin
router.put('/:id', roleGuard('ADMIN'), verifyKelompokTani);

// Get stats - only Admin
router.get('/stats', roleGuard('ADMIN'), getKelompokTaniStats);

export default router;

