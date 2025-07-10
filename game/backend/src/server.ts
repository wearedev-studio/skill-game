import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import { handleGameSockets } from './sockets/gameSocket';

// Загрузка переменных окружения
dotenv.config();

// Подключение к БД
connectDB();

const app = express();

// Middleware
app.use(cors()); // Включить CORS для всех маршрутов
app.use(express.json()); // Для парсинга JSON тел запросов

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Создание HTTP и Socket.IO серверов
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Замените на URL вашего фронтенда
    methods: ["GET", "POST"]
  }
});

// Обработка сокет-соединений
handleGameSockets(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));