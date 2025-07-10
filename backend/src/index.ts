import express from 'express';
import { createServer } from 'http'; // <-- Импортируем createServer
import { Server } from 'socket.io'; // <-- Импортируем Server из socket.io
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import walletRoutes from './routes/walletRoutes';

import { checkWinner } from './utils/gameLogic';

const WIN_COMMISSION_RATE = 0.10; // 10% комиссия с выигрыша (от суммы ставки)
const DRAW_COMMISSION_RATE = 0.05; // 5% комиссия с каждого игрока при ничьей

connectDB();

const app = express();
// Создаем HTTP сервер на основе нашего Express приложения
const httpServer = createServer(app);

// Подключаем Socket.IO к HTTP серверу и настраиваем CORS
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // URL вашего фронтенда (Player Cabinet)
    methods: ["GET", "POST"]
  }
});

const PORT = 3001;

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);

// ... внутри src/index.ts ...

// Простой менеджер для ожидания игры и активных игр
let waitingPlayers: { socketId: any, bet: number }[] = [];
const activeGames: {
  [key: string]: {
    players: string[],
    board: (string | null)[],
    turn: string,
    bet: number
  }
} = {};

io.on('connection', (socket) => {
  console.log(`💡 New client connected: ${socket.id}`);

  // Событие для поиска матча

  socket.on('findMatch', async ({ bet }) => {
    const betAmount = Number(bet);
    if (!betAmount || betAmount <= 0) return; // Проверка на корректность ставки

    // Проверяем баланс игрока, который ищет игру
    // Для этого нужно связать socket.id с userId (в реальном проекте это делается при подключении)
    // Пока мы эту связь опустим для простоты, но в проде она ОБЯЗАТЕЛЬНА.

    const opponent = waitingPlayers.find(p => p.bet === betAmount && p.socketId !== socket.id);

    if (opponent) {
      // Оппонент найден
      waitingPlayers = waitingPlayers.filter(p => p.socketId !== opponent.socketId); // Убираем оппонента из очереди

      const player1 = opponent.socketId;
      const player2 = socket.id;
      const gameId = `${player1}-${player2}`;

      activeGames[gameId] = {
        players: [player1, player2],
        board: Array(9).fill(null),
        turn: player1,
        bet: betAmount, // <-- Сохраняем ставку в данных игры
      };

      io.sockets.sockets.get(player1)?.join(gameId);
      io.sockets.sockets.get(player2)?.join(gameId);

      io.to(gameId).emit('matchFound', {
        gameId: gameId,
        players: { X: player1, O: player2 },
        bet: betAmount
      });
    } else {
      // Проверяем, не находится ли игрок уже в очереди
      const isAlreadyWaiting = waitingPlayers.some(p => p.socketId === socket.id);
      if (!isAlreadyWaiting) {
        waitingPlayers.push({ socketId: socket.id, bet: betAmount });
        socket.emit('waitingForOpponent');
      }
    }
  });

  // Событие "сделать ход"
  socket.on('makeMove', ({ gameId, index }) => {
    const game = activeGames[gameId];
    if (!game || game.turn !== socket.id || game.board[index] !== null) {
      // Некорректный ход (игра не найдена, не ваш ход, или ячейка занята)
      return;
    }

    const currentPlayerSymbol = game.players[0] === socket.id ? 'X' : 'O';
    game.board[index] = currentPlayerSymbol;
    game.turn = game.players.find(p => p !== socket.id)!; // Передаем ход другому игроку

    // Отправляем обновленное состояние игры всем в комнате
    io.to(gameId).emit('gameStateUpdate', game.board);

    // Тут должна быть проверка на победителя, но для простоты пока опустим
    const winner = checkWinner(game.board);
    if (winner) {
      io.to(gameId).emit('gameOver', { winner });
      // ... удаляем игру
    } else if (!game.board.includes(null)) { // Проверяем, есть ли пустые клетки
      // Ничья
      io.to(gameId).emit('gameOver', { winner: 'draw' }); // или { winner: null }
      delete activeGames[gameId];
    }

    
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    waitingPlayers = waitingPlayers.filter(p => p.socketId !== socket.id);

    // Находим игру, в которой участвовал отключившийся игрок
    const gameId = Object.keys(activeGames).find(id =>
      activeGames[id].players.includes(socket.id)
    );

    if (gameId) {
      const game = activeGames[gameId];
      // Находим оставшегося игрока
      const remainingPlayer: any = game.players.find(p => p !== socket.id);

      // Оповещаем его о победе
      io.to(remainingPlayer).emit('opponentDisconnected', { winner: remainingPlayer });

      // Удаляем игру
      delete activeGames[gameId];
    }
  });
});

// ... остальной код сервера

// Запускаем HTTP сервер вместо app.listen
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});