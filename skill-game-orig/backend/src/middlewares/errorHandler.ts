import { Request, Response, NextFunction } from 'express';

// Middleware для обработки ошибок должен принимать 4 аргумента
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Логируем ошибку в консоль для дебага
  console.error(err.stack); 

  // Отправляем клиенту стандартизированный ответ об ошибке
  res.status(500).json({
    success: false,
    message: 'Произошла внутренняя ошибка сервера.',
  });
};