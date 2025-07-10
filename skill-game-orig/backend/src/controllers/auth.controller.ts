import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password } = req.body;
      // Валидацию данных лучше вынести в middleware (например, с помощью Joi или Zod)
      if (!username || !email || !password) {
        res.status(400).json({ message: 'Все поля обязательны' });
        return;
      }
      
      await AuthService.register({ username, email, passwordHash: password });
      res.status(201).json({ message: 'Регистрация успешна. Проверьте вашу почту для верификации.' });
    } catch (error) {
      // next(error) передаст ошибку в централизованный обработчик ошибок
      next(error); 
    }
  }

  public static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        res.status(400).json({ message: 'Email и код обязательны' });
        return;
      }
      
      await AuthService.verifyEmail(email, code);
      res.status(200).json({ message: 'Email успешно подтвержден!' });
    } catch (error) {
      next(error); 
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
       if (!email || !password) {
        res.status(400).json({ message: 'Email и пароль обязательны' });
        return;
      }

      const token = await AuthService.login(email, password);
      res.status(200).json({ token });
    } catch (error) {
      next(error); 
    }
  }
}