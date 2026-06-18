import express from 'express';
import { getAdminStats, getAllUsers, approveProvider } from '../controllers/admin.controller';
import { updateServiceStatus } from '../controllers/service.controller';
import { createCategory, deleteCategory } from '../controllers/category.controller';
import { checkDB, authenticateToken, authenticateAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/stats', checkDB, authenticateToken, authenticateAdmin, getAdminStats);
router.get('/users', checkDB, authenticateToken, authenticateAdmin, getAllUsers);
router.patch('/users/:id/approve', checkDB, authenticateToken, authenticateAdmin, approveProvider);

// Service Moderation
router.patch('/services/:id/status', checkDB, authenticateToken, authenticateAdmin, updateServiceStatus);

// Category Management
router.post('/categories', checkDB, authenticateToken, authenticateAdmin, createCategory);
router.delete('/categories/:id', checkDB, authenticateToken, authenticateAdmin, deleteCategory);

export default router;
