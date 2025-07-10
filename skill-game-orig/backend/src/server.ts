import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { UserModel } from './models/User';
import authRoutes from './api/auth.routes';

import { errorHandler } from './middlewares/errorHandler';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { /* ... cors settings ... */ });

app.use('/api/auth', authRoutes);

app.use(errorHandler);

// Middleware для аутентификации сокетов
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const payload = jwt.verify(token, 'YOUR_SECRET_JWT_KEY') as { userId: string };
    socket.data.userId = payload.userId; // Сохраняем ID пользователя в данных сокета
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', async (socket) => {
  const userId = socket.data.userId;
  console.log(`User ${userId} connected with socket id ${socket.id}`);

  // Обновляем статус пользователя в БД на "онлайн"
  await UserModel.findByIdAndUpdate(userId, { status: 'online' });
  // Здесь можно оповестить других пользователей, что этот игрок теперь в сети

  socket.on('disconnect', async () => {
    console.log(`User ${userId} disconnected`);
    // Обновляем статус пользователя в БД на "офлайн"
    await UserModel.findByIdAndUpdate(userId, { status: 'offline' });
    // Оповещаем остальных об уходе
  });

  // ... здесь будут слушатели для игровых событий
});

// ... запуск сервера
server.listen(3000, () => {
  console.log('Server is running on port 3000');
});