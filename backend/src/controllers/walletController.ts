import { Request, Response } from 'express';
import User from '../models/User';

/**
 * @desc    Получить баланс текущего пользователя
 * @route   GET /api/wallet/balance
 * @access  Private
 */
export const getBalance = async (req: Request, res: Response) => {
  // req.user добавляется нашим authMiddleware
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({ balance: user.balance });
  } else {
    res.status(404).json({ message: 'Пользователь не найден' });
  }
};

/**
 * @desc    Пополнить баланс (имитация)
 * @route   POST /api/wallet/deposit
 * @access  Private
 */
export const depositFunds = async (req: Request, res: Response) => {
  const { amount } = req.body;
  const depositAmount = Number(amount);

  if (!depositAmount || depositAmount <= 0) {
    return res.status(400).json({ message: 'Некорректная сумма пополнения' });
  }

  const user = await User.findById(req.user._id);

  if (user) {
    user.balance = (user.balance || 0) + depositAmount;
    await user.save();
    res.json({ balance: user.balance });
  } else {
    res.status(404).json({ message: 'Пользователь не найден' });
  }
};