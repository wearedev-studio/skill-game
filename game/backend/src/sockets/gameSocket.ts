// // import { Server, Socket } from 'socket.io';

// // const games: Record<string, any> = {};

// // const calculateWinner = (squares: (string | null)[]) => {
// //     const lines = [
// //       [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
// //       [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
// //       [0, 4, 8], [2, 4, 6]             // diagonals
// //     ];
// //     for (let i = 0; i < lines.length; i++) {
// //       const [a, b, c] = lines[i];
// //       if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
// //         return squares[a];
// //       }
// //     }
// //     return squares.every(square => square) ? 'draw' : null;
// // };

// // export const handleGameSockets = (io: Server) => {
// //     io.on('connection', (socket: Socket) => {
// //         console.log(`User connected: ${socket.id}`);

// //         socket.on('joinGame', ({ gameId }) => {
// //             socket.join(gameId);
// //             console.log(`User ${socket.id} joined game ${gameId}`);
            
// //             if (!games[gameId]) {
// //                 games[gameId] = {
// //                     players: [socket.id],
// //                     board: Array(9).fill(null),
// //                     currentPlayer: 'X',
// //                 };
// //             } else if (games[gameId].players.length < 2 && !games[gameId].players.includes(socket.id)) {
// //                 games[gameId].players.push(socket.id);
// //             }

// //             if (games[gameId].players.length === 2) {
// //                 io.to(gameId).emit('gameStart', {
// //                     ...games[gameId],
// //                     players: { X: games[gameId].players[0], O: games[gameId].players[1] }
// //                 });
// //             }
// //         });

// //         socket.on('makeMove', ({ gameId, index }) => {
// //             const game = games[gameId];
// //             if (!game || game.board[index] || calculateWinner(game.board)) {
// //                 return;
// //             }

// //             const playerSymbol = game.players.indexOf(socket.id) === 0 ? 'X' : 'O';
// //             if (game.currentPlayer !== playerSymbol) {
// //                 // Ход не этого игрока
// //                 return;
// //             }

// //             game.board[index] = playerSymbol;
// //             const winner = calculateWinner(game.board);
// //             game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';

// //             io.to(gameId).emit('moveMade', {
// //                 board: game.board,
// //                 currentPlayer: game.currentPlayer,
// //                 winner: winner,
// //             });

// //             if (winner) {
// //                 delete games[gameId];
// //             }
// //         });

// //         socket.on('disconnect', () => {
// //             console.log(`User disconnected: ${socket.id}`);
// //             // Здесь можно добавить логику обработки отключения игрока из активной игры
// //         });
// //     });
// // };

// import { Server, Socket } from 'socket.io';

// // --- Структуры данных для управления игрой ---

// // Очередь игроков, ожидающих начала игры
// const waitingQueue: { socketId: string, user: any }[] = [];

// // Хранилище активных игр
// const games: Record<string, any> = {};

// // --- Вспомогательные функции ---

// const calculateWinner = (squares: (string | null)[]) => {
//     const lines = [
//       [0, 1, 2], [3, 4, 5], [6, 7, 8],
//       [0, 3, 6], [1, 4, 7], [2, 5, 8],
//       [0, 4, 8], [2, 4, 6]
//     ];
//     for (let i = 0; i < lines.length; i++) {
//       const [a, b, c] = lines[i];
//       if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
//         return squares[a]; // 'X' или 'O'
//       }
//     }
//     return squares.every(square => square) ? 'draw' : null;
// };

// // --- Основная логика сокетов ---

// export const handleGameSockets = (io: Server) => {
//     io.on('connection', (socket: Socket) => {
//         console.log(`User connected: ${socket.id}`);

//         // 1. Поиск игры
//         socket.on('findGame', ({ user }) => {
//             console.log(`${user.username} is looking for a game.`);
//             // Добавляем игрока в очередь
//                     if (waitingQueue.length >= 2) {
//             // --- НАЧАЛО ИЗМЕНЕНИЙ ---

//             // Берем двух игроков из очереди
//             const player1 = waitingQueue.shift()!;
//             const player2 = waitingQueue.shift()!;

//             // По умолчанию, первый игрок - 'X', второй - 'O'
//             let playerX = player1;
//             let playerO = player2;

//             // С вероятностью 50% меняем их местами
//             if (Math.random() < 0.5) {
//                 [playerX, playerO] = [player2, player1];
//                 console.log(`Randomized players: ${playerX.user.username} is now X.`);
//             } else {
//                 console.log(`Players assigned: ${playerX.user.username} is X.`);
//             }

//             const gameId = `${playerX.socketId}-${playerO.socketId}`;

//             // Формируем объект с игроками, где ключи - их символы
//             const playersInfo = {
//                 'X': { ...playerX.user, socketId: playerX.socketId },
//                 'O': { ...playerO.user, socketId: playerO.socketId }
//             };

//             // Создаем объект игры
//             games[gameId] = {
//                 gameId,
//                 players: playersInfo,
//                 board: Array(9).fill(null),
//                 currentPlayer: 'X', // 'X' всегда ходит первым
//                 rematchInfo: {
//                     offeredBy: null,
//                     acceptedBy: [],
//                     timer: null
//                 }
//             };

//             console.log(`Game created: ${gameId} between ${playersInfo['X'].username} (X) and ${playersInfo['O'].username} (O)`);

//             // Сообщаем обоим игрокам, что игра найдена, и передаем им информацию об игроках
//             io.to(playerX.socketId).to(playerO.socketId).emit('gameFound', { gameId, players: playersInfo });
//             }
//         });

//         // 2. Выход из поиска
        // socket.on('cancelFindGame', () => {
        //     const index = waitingQueue.findIndex(p => p.socketId === socket.id);
        //     if (index > -1) {
        //         waitingQueue.splice(index, 1);
        //         console.log(`User ${socket.id} cancelled search.`);
        //     }
        // });

//         // 3. Ход в игре
//         socket.on('makeMove', ({ gameId, index, playerSymbol }) => {
//             const game = games[gameId];
//             if (!game || game.board[index] || calculateWinner(game.board) || game.currentPlayer !== playerSymbol) {
//                 return; // Игнорируем невалидный ход
//             }

//             game.board[index] = playerSymbol;
//             const winnerSymbol = calculateWinner(game.board);
//             let winnerSocketId = null;

//             if (winnerSymbol && winnerSymbol !== 'draw') {
//                 winnerSocketId = game.players[winnerSymbol].socketId;
//             }

//             game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';

//             // Отправляем обновленное состояние всем в комнате
//             io.in(gameId).emit('moveMade', {
//                 board: game.board,
//                 currentPlayer: game.currentPlayer,
//             });

//             // Если есть победитель, сообщаем об этом
//             if (winnerSymbol) {
//                 io.in(gameId).emit('gameOver', { winnerSymbol, winnerSocketId });
//             }
//         });

//         // 4. Предложение реванша (ИСПРАВЛЕННАЯ ВЕРСИЯ)
//         socket.on('offerRematch', ({ gameId }) => {
//             const game = games[gameId];
//             if (!game) return;

//             // Безопасно ищем оппонента
//             const opponent: any = Object.values(game.players).find((p: any) => p.socketId !== socket.id);

//             // Проверяем, что оппонент найден
//             if (!opponent) {
//                 console.error(`Could not find opponent for socket ${socket.id} in game ${gameId}`);
//                 // Можно добавить логику по очистке "сломанной" игры
//                 return;
//             }

//             console.log(`Rematch offered by ${socket.id} in game ${gameId}`);
//             game.rematchInfo.offeredBy = socket.id;

//             // Теперь мы уверены, что оппонент существует
//             io.to(opponent.socketId).emit('rematchOffered', { offeredBy: socket.id });

//             // Запускаем 5-секундный таймер на сервере
//             game.rematchInfo.timer = setTimeout(() => {
//                 // Проверяем, что игра все еще существует перед отправкой события
//                 if (games[gameId] && games[gameId].rematchInfo.acceptedBy.length < 2) {
//                     io.in(gameId).emit('rematchRejected');
//                     delete games[gameId];
//                 }
//             }, 5000);
//         });

//         // 5. Принятие реванша
//         socket.on('acceptRematch', ({ gameId }) => {
//             const game = games[gameId];
//             if (!game || !game.rematchInfo.offeredBy || game.rematchInfo.acceptedBy.includes(socket.id)) return;
            
//             game.rematchInfo.acceptedBy.push(socket.id);
            
//             // Если оба игрока (тот, кто предложил, и тот, кто принял) согласны
//             if (game.rematchInfo.acceptedBy.length === 2 || game.rematchInfo.acceptedBy.includes(game.rematchInfo.offeredBy)) {
//                 clearTimeout(game.rematchInfo.timer!);

//                 // Сбрасываем состояние игры для реванша
//                 game.board = Array(9).fill(null);
//                 game.currentPlayer = 'X'; // Или случайный выбор
//                 game.rematchInfo = { offeredBy: null, acceptedBy: [], timer: null };

//                 io.in(gameId).emit('rematchAccepted', {
//                     board: game.board,
//                     currentPlayer: game.currentPlayer
//                 });
//             }
//         });

//         // 6. Отказ от реванша
//         socket.on('rejectRematch', ({ gameId }) => {
//             const game = games[gameId];
//             if (!game) return;
            
//             clearTimeout(game.rematchInfo.timer!);
//             io.in(gameId).emit('rematchRejected');
//             delete games[gameId];
//         });

//         // 7. Присоединение к комнате игры
//         socket.on('joinGameRoom', (gameId) => {
//             socket.join(gameId);
//         });

//         // Обработка отключения
        // socket.on('disconnect', () => {
        //     console.log(`User disconnected: ${socket.id}`);
        //     // Удаляем из очереди, если он там был
        //     const index = waitingQueue.findIndex(p => p.socketId === socket.id);
        //     if (index > -1) {
        //         waitingQueue.splice(index, 1);
        //     }
        //     // Здесь можно добавить логику завершения игры, если один из игроков отключился
        //     // Например, найти игру, где был этот сокет, и оповестить другого игрока.
        // });
//     });
// };

import { Server, Socket } from 'socket.io';

const waitingQueue: { socketId: string, user: any }[] = [];
const games: Record<string, any> = {};

const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.every(square => square) ? 'draw' : null;
};

export const handleGameSockets = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log(`[Connection] User connected: ${socket.id}`);

        socket.on('findGame', ({ user }) => {
            console.log(`[FindGame] User ${user.username} (${socket.id}) is looking for a game.`);
            if (waitingQueue.some(p => p.user._id === user._id)) {
                console.log(`[FindGame] User ${user.username} is already in queue.`);
                return;
            }
            waitingQueue.push({ socketId: socket.id, user });
            console.log(`[Queue] Current queue size: ${waitingQueue.length}`);

            if (waitingQueue.length >= 2) {
                const player1 = waitingQueue.shift()!;
                const player2 = waitingQueue.shift()!;
                console.log(`[Match] Found a pair: ${player1.user.username} and ${player2.user.username}`);

                let [playerX, playerO] = [player1, player2];
                if (Math.random() < 0.5) {
                    [playerX, playerO] = [player2, player1];
                }
                
                const gameId = `${playerX.socketId}-${playerO.socketId}`;
                const playersInfo = {
                    'X': { ...playerX.user, socketId: playerX.socketId },
                    'O': { ...playerO.user, socketId: playerO.socketId }
                };

                games[gameId] = {
                    gameId,
                    players: playersInfo,
                    board: Array(9).fill(null),
                    currentPlayer: 'X',
                    rematchInfo: { offeredBy: null, acceptedBy: [], timer: null }
                };
                
                console.log(`[GameCreated] ID: ${gameId}. X: ${playersInfo['X'].username}, O: ${playersInfo['O'].username}.`);

                io.to(playerX.socketId).to(playerO.socketId).emit('gameFound', { gameId });
            }
        });

        // НОВЫЙ И САМЫЙ ВАЖНЫЙ ОБРАБОТЧИК
        socket.on('requestGameState', (gameId) => {
            const game = games[gameId];
            if (game) {
                console.log(`[StateRequest] Sending game state for ${gameId} to ${socket.id}`);
                // Присоединяем игрока к комнате и отправляем ему состояние
                socket.join(gameId);
                io.to(socket.id).emit('gameStateUpdate', game);
            } else {
                console.log(`[StateRequest] Game ${gameId} not found.`);
                io.to(socket.id).emit('gameNotFound');
            }
        });

        socket.on('makeMove', ({ gameId, index, playerSymbol }) => {
            const game = games[gameId];
            if (!game || game.board[index] || calculateWinner(game.board) || game.currentPlayer !== playerSymbol) {
                return;
            }

            game.board[index] = playerSymbol;
            const winnerSymbol = calculateWinner(game.board);
            game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';

            io.in(gameId).emit('gameStateUpdate', game);

            if (winnerSymbol) {
                io.in(gameId).emit('gameOver', { winnerSymbol });
            }
        });

        // Логика реванша и отключения (остается без изменений)
        socket.on('offerRematch', ({ gameId }) => {
            const game = games[gameId];
            if (!game) return;

            const opponent: any = Object.values(game.players).find((p: any) => p.socketId !== socket.id);
            if (!opponent) { return; }

            

            console.log(`[Rematch] Offer from ${socket.id} to ${opponent.socketId} in game ${gameId}`);
            game.rematchInfo = {
                offeredBy: socket.id,
                acceptedBy: [socket.id], // Сразу добавляем его в список согласившихся
                timer: null
            };

            io.to(opponent.socketId).emit('rematchOffered');

            // Запускаем 5-секундный таймер на сервере
            // Очищаем предыдущий таймер, если он был
            if (game.rematchInfo.timer) clearTimeout(game.rematchInfo.timer);
            game.rematchInfo.timer = setTimeout(() => {
                const currentGame = games[gameId];
                if (currentGame && currentGame.rematchInfo.offeredBy) {
                    console.log(`[Rematch] Timer expired for game ${gameId}.`);
                    io.in(gameId).emit('rematchRejected');
                    delete games[gameId];
                }
            }, 5100); // 5.1 секунды для надежности
        });

         socket.on('acceptRematch', ({ gameId }) => {
            const game = games[gameId];
            // Проверяем, что игра существует, предложение было сделано и текущий игрок еще не соглашался
            if (!game || !game.rematchInfo.offeredBy || game.rematchInfo.acceptedBy.includes(socket.id)) {
                return;
            }
            
            console.log(`[Rematch] Accepted by ${socket.id} in game ${gameId}`);
            game.rematchInfo.acceptedBy.push(socket.id);
            
            // Если оба игрока (тот, кто предложил, и тот, кто принял) согласны
            if (game.rematchInfo.acceptedBy.length === 2) {
                if (game.rematchInfo.timer) clearTimeout(game.rematchInfo.timer);

                console.log(`[Rematch] Both players agreed. Resetting game ${gameId}.`);
                // Сбрасываем состояние игры для реванша
                game.board = Array(9).fill(null);
                game.currentPlayer = 'X'; // Для простоты X всегда ходит первым в реванше
                game.rematchInfo = { offeredBy: null, acceptedBy: [], timer: null };

                // Отправляем полное обновленное состояние игры обоим игрокам
                io.in(gameId).emit('rematchAccepted', game);
            }
        });

        socket.on('rejectRematch', ({ gameId }) => {
            const game = games[gameId];
            if (!game) return;
            
            console.log(`[Rematch] Explicit rejection in game ${gameId}`);
            if (game.rematchInfo.timer) clearTimeout(game.rematchInfo.timer);

            io.in(gameId).emit('rematchRejected');
            delete games[gameId];
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            // Удаляем из очереди, если он там был
            const index = waitingQueue.findIndex(p => p.socketId === socket.id);
            if (index > -1) {
                waitingQueue.splice(index, 1);
            }
            // Здесь можно добавить логику завершения игры, если один из игроков отключился
            // Например, найти игру, где был этот сокет, и оповестить другого игрока.
        });

        socket.on('cancelFindGame', () => {
            const index = waitingQueue.findIndex(p => p.socketId === socket.id);
            if (index > -1) {
                waitingQueue.splice(index, 1);
                console.log(`User ${socket.id} cancelled search.`);
            }
        });
    });
};