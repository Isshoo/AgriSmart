import express from 'express';
import { getAllKecamatan, createKecamatan } from '../controllers/kecamatan.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { roleGuard } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all kecamatan - accessible by all roles
router.get('/', getAllKecamatan);

// Create kecamatan - only Admin
router.post('/', roleGuard('ADMIN'), createKecamatan);

export default router;

