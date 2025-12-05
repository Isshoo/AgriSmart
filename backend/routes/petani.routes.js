import express from 'express';
import {
  getAllPetani,
  getPetaniById,
  createPetani,
  updatePetani,
  deletePetani
} from '../controllers/petani.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { roleGuard } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all petani - accessible by all roles
router.get('/', getAllPetani);

// Get petani by id - accessible by all roles
router.get('/:id', getPetaniById);

// Create, update, delete - only Penyuluh and Admin
router.post('/', roleGuard('PENYULUH', 'ADMIN'), createPetani);
router.put('/:id', roleGuard('PENYULUH', 'ADMIN'), updatePetani);
router.delete('/:id', roleGuard('ADMIN'), deletePetani);

export default router;

