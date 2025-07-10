import { Request, Response } from 'express';
import User from '../models/User';

// @ts-ignore
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    }
}

// GET /api/users/profile
export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.id).select('-passwordHash');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// PUT /api/users/profile
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.id);
        if (user) {
            user.username = req.body.username || user.username;
            user.avatar = req.body.avatar || user.avatar;
            
            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                balance: updatedUser.balance,
            });
        } else {
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};