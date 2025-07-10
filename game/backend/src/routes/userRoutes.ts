import { Router } from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

export default router;