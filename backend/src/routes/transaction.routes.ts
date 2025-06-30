import { Router } from 'express';
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionStatus,
  getOverdueTransactions,
  getUserTransactions,
} from '../controllers/transaction.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { transactionSchema } from '../utils/validation.util';

const router = Router();

// Get all transactions
router.get('/', protect, getAllTransactions);

// Get overdue transactions
router.get('/overdue', protect, authorize('admin', 'staff'), getOverdueTransactions);

// Get user transactions
router.get('/user', protect, getUserTransactions);

// Get single transaction
router.get('/:id', protect, getTransactionById);

// Create a new transaction
router.post(
  '/',
  protect,
  validate(transactionSchema),
  createTransaction
);

// Update a transaction status
router.patch(
  '/:id/status',
  protect,
  authorize('admin', 'staff'),
  updateTransactionStatus
);

export default router;
