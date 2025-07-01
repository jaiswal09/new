import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, transactionController.getAllTransactions);
router.post('/', authMiddleware, transactionController.createTransaction);

export default router;