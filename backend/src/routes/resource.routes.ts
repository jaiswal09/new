import { Router } from 'express';
import {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getLowStockResources,
  getResourcesByExpiry,
} from '../controllers/resource.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { resourceSchema } from '../utils/validation.util';

const router = Router();

// Get all resources
router.get('/', protect, getAllResources);

// Get low stock resources
router.get('/low-stock', protect, getLowStockResources);

// Get resources by expiry date
router.get('/expiry', protect, getResourcesByExpiry);

// Get single resource
router.get('/:id', protect, getResourceById);

// Create a new resource
router.post(
  '/',
  protect,
  authorize('admin', 'staff'),
  validate(resourceSchema),
  createResource
);

// Update a resource
router.put(
  '/:id',
  protect,
  authorize('admin', 'staff'),
  updateResource
);

// Delete a resource
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteResource
);

export default router;
