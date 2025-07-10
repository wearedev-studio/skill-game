import express from 'express';
import { getBalance, depositFunds } from '../controllers/walletController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Все роуты в этом файле будут защищены и доступны только авторизованным пользователям
router.route('/balance').get(protect, getBalance);
router.route('/deposit').post(protect, depositFunds);

export default router;