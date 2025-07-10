import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendPasswordResetCode } from '../services/emailService';

// Генерация токена
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
};

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ username, email, passwordHash });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                balance: user.balance,
                token: generateToken(user._id.toString()),
            });
        } else {
            res.status(401).json({ message: 'Неверный email или пароль' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// POST /api/auth/request-reset
export const requestPasswordReset = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        
        const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4-значный код
        user.resetPasswordCode = code;
        user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут
        
        await user.save();
        
        await sendPasswordResetCode(user.email, code);

        res.status(200).json({ message: 'Код сброса отправлен на ваш email' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Не удалось отправить email' });
    }
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response) => {
    const { email, code, password } = req.body;
    try {
        const user = await User.findOne({
            email,
            resetPasswordCode: code,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordCode +resetPasswordExpires');

        if (!user) {
            return res.status(400).json({ message: 'Неверный код или срок его действия истек' });
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(password, salt);
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Пароль успешно сброшен' });

    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};