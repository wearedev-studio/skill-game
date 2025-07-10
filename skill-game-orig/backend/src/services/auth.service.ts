import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/User';
import { generateFourDigitCode } from '../utils/codeGenerator';
import { EmailService } from './email.service';

// Устанавливаем зависимости: npm install bcrypt jsonwebtoken @types/bcrypt @types/jsonwebtoken
// JWT_SECRET должен храниться в переменных окружения (.env)
const JWT_SECRET = 'your-super-secret-key'; 

export class AuthService {
  
  public static async register(userData: Pick<IUser, 'username' | 'email' | 'passwordHash'>): Promise<IUser> {
    const { username, email, passwordHash } = userData;

    const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new Error('Пользователь с таким email или username уже существует');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordHash, salt);
    
    const verificationCode = generateFourDigitCode();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

    const newUser = new UserModel({
      username,
      email,
      passwordHash: hashedPassword,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires,
    });

    await EmailService.sendVerificationCode(email, verificationCode);
    return newUser.save();
  }

  public static async verifyEmail(email: string, code: string): Promise<IUser> {
    const user = await UserModel.findOne({ email });
    if (!user || user.isVerified) {
      throw new Error('Пользователь не найден или уже верифицирован');
    }

    if (user.emailVerificationCode !== code || (user.emailVerificationExpires && user.emailVerificationExpires < new Date())) {
      throw new Error('Неверный или просроченный код подтверждения');
    }

    user.isVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;

    return user.save();
  }

  public static async login(email: string, password: string): Promise<string> {
    const user = await UserModel.findOne({ email });
    if (!user || !user.isVerified) {
      throw new Error('Неверные учетные данные или email не подтвержден');
    }
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Неверные учетные данные');
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    return token;
  }
  
  // Методы для сброса пароля можно добавить по аналогии...
}