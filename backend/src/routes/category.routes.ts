import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { categorySchema } from '../utils/validation.util';

const router = Router();

// Get all categories
router.get('/', protect, getAllCategories);

// Get single category
router.get('/:id', protect, getCategoryById);

// Create a new category
router.post(
  '/',
  protect,
  authorize('admin', 'staff'),
  validate(categorySchema),
  createCategory
);

// Update a category
router.put(
  '/:id',
  protect,
  authorize('admin', 'staff'),
  updateCategory
);

// Delete a category
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteCategory
);

export default router;
