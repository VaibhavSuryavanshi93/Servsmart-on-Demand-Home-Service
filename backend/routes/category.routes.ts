import express from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/category.controller';
import { checkDB, authenticateToken, authenticateAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/', checkDB, getCategories);
router.post('/', checkDB, authenticateToken, authenticateAdmin, createCategory);
router.delete('/:id', checkDB, authenticateToken, authenticateAdmin, deleteCategory);

export default router;
