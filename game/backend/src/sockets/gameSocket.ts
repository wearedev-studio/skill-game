import { Server, Socket } from 'socket.io';
// 1. Импортируем модули с правилами для каждой игры
import * as ticTacToeLogic from '../game-logic/ticTacToe';
import * as checkersLogic from '../game-logic/checkers';
import * as backgammonLogic from '../game-logic/backgammon';
import * as chessLogic from '../game-logic/chess';


// 2. Создаем объект-карту, где каждому типу игры соответствует свой модуль с правилами.
// Это позволяет легко добавить новую игру, просто добавив сюда еще одну строчку.
const gameModules: any = {
    'tic-tac-toe': ticTacToeLogic,
    'checkers': checkersLogic,
    'chess': chessLogic,
    'backgammon': backgammonLogic,

};

// 3. Очереди ожидания теперь тоже разделены по типу игры.
// Когда игрок ищет игру, он попадает в очередь для "шашек" или "крестиков-ноликов".
const waitingQueues: any = {
    'tic-tac-toe': [] as any[],
    'checkers': [] as any[],
    'chess': [],
    'backgammon': [],
};

type GameType = keyof typeof gameModules;
type Player = 'w' | 'b' | 'X' | 'O'; 

// 4. Хранилище активных игр. Структура осталась общей.
const games: Record<string, any> = {};

function getOpponent(player: Player): Player {
    if (player === 'w') return 'b';
    if (player === 'b') return 'w';
    if (player === 'X') return 'O';
    return 'X'; // Если игрок 'O'
}

function isValidGameType(gameType: any): gameType is GameType {
    return gameType in gameModules;
}

export const handleGameSockets = (io: Server) => {
    io.on('connection', (socket: Socket) => {

        socket.on('findGame', ({ user, gameType }) => {
            // @ts-ignore
            if (!isValidGameType(gameType) || waitingQueues[gameType].some(p => p.user._id === user._id)) {
                return;
            }
            
            const queue = waitingQueues[gameType];
            queue.push({ socketId: socket.id, user });

            if (queue.length >= 2) {
                const p1 = queue.shift()!;
                const p2 = queue.shift()!;
                const gameId = `${p1.socketId}-${p2.socketId}`;
                const gameModule = gameModules[gameType];

                // --- УНИВЕРСАЛЬНАЯ ЛОГИКА СОЗДАНИЯ ИГРОКОВ ---
                // Определяем правильные символы для игры
                const symbols = (gameType === 'tic-tac-toe') ? ['X', 'O'] : ['w', 'b'];
                // Случайно их распределяем
                const [s1, s2] = Math.random() < 0.5 ? [symbols[0], symbols[1]] : [symbols[1], symbols[0]];

                // Создаем "чистый" объект игроков с правильными ключами
                const playersInfo = {
                    [s1]: { _id: p1.user._id.toString(), username: p1.user.username, socketId: p1.socketId },
                    [s2]: { _id: p2.user._id.toString(), username: p2.user.username, socketId: p2.socketId },
                };
                // --- КОНЕЦ УНИВЕРСАЛЬНОЙ ЛОГИКИ ---
                
                games[gameId] = {
                    gameId,
                    gameType,
                    players: playersInfo,
                    gameState: gameModule.getInitialState()
                };

                io.to(p1.socketId).to(p2.socketId).emit('gameFound', { gameId });
            }
        });

        socket.on('submitTurn', ({ gameId, moves }) => {
            const game = games[gameId];
            if (!game || game.gameType !== 'backgammon') return;

            const result = backgammonLogic.applyTurn(game.gameState, moves);

            // --- НАЧАЛО ИЗМЕНЕНИЙ ---
            if (result.error) {
                console.log(`[Invalid Turn] Game ${gameId}: ${result.error}`);
                // Отправляем ошибку обратно ТОЛЬКО тому, кто сделал неверный ход
                io.to(socket.id).emit('turnError', { message: result.error });
                return;
            }
            // --- КОНЕЦ ИЗМЕНЕНИЙ ---
            
            // Если все хорошо, обновляем состояние
            const nextPlayer = getOpponent(game.gameState.currentPlayer!);
            // @ts-ignore
            result.newState.currentPlayer = nextPlayer;
            game.gameState = result.newState;
            
            io.in(gameId).emit('gameStateUpdate', game);

            if (result.winner) {
                io.in(gameId).emit('gameOver', { winnerSymbol: result.winner });
            }
        });

        // --- Обработчик запроса состояния игры ---
        // Его задача - найти игру по ID и отправить ее состояние запросившему клиенту.
        // Это делает клиент устойчивым к перезагрузкам.
        socket.on('requestGameState', (gameId) => {
            const game = games[gameId];
            if (game) {
                socket.join(gameId); // Добавляем сокет в "комнату" игры для будущих рассылок
                io.to(socket.id).emit('gameStateUpdate', game);
            } else {
                io.to(socket.id).emit('gameNotFound');
            }
        });

        // --- ГЛАВНЫЙ ОБРАБОТЧИК ХОДА (ДИСПЕТЧЕР) ---
        // Он не знает, как делать ход. Он только передает данные в нужный модуль.
        socket.on('makeMove', ({ gameId, move }) => {
            const game = games[gameId];
            if (!game) return;

            // 1. Определяем, какой "движок" использовать, по 'gameType' из объекта игры.
            const gameModule = gameModules[game.gameType];

            // 2. Вызываем функцию 'applyMove' из этого модуля.
            // Передаем ей текущее состояние игры (gameState) и сам ход (move).
            const result = gameModule.applyMove(game.gameState, move);

            if (result.error) {
                console.log(`Invalid move in game ${gameId}: ${result.error}`);
                // Можно отправить ошибку обратно игроку, если нужно
                return;
            }

            // 3. Обновляем 'gameState' в нашем объекте игры результатом из модуля.
            game.gameState = result.newState;

            // 4. Рассылаем ВСЕМ игрокам в комнате обновленный объект игры.
            io.in(gameId).emit('gameStateUpdate', game);

            // 5. Если модуль сообщил, что есть победитель, объявляем об окончании игры.
            if (result.winner) {
                io.in(gameId).emit('gameOver', { winnerSymbol: result.winner });
            }
        });

        // --- НАЧАЛО НОВЫХ ОБРАБОТЧИКОВ ДЛЯ НАРД ---

        socket.on('rollDice', ({ gameId }) => {
            const game = games[gameId];
            if (!game || game.gameType !== 'backgammon') return;
            
            const playerSymbol = Object.keys(game.players).find(key => game.players[key].socketId === socket.id);
            if(game.gameState.currentPlayer !== playerSymbol && game.gameState.currentPlayer !== null) return;
            
            // Определяем, кто ходит, если это первый бросок
            if (game.gameState.currentPlayer === null) {
                // В реальных нардах для первого хода бросают по одной кости, мы упростим
                game.gameState.currentPlayer = Math.random() < 0.5 ? 'w' : 'b';
            }

            game.gameState.dice = backgammonLogic.rollDice();
            io.in(gameId).emit('gameStateUpdate', game);
        });

        socket.on('submitTurn', ({ gameId, moves }) => {
            const game = games[gameId];
            if (!game || game.gameType !== 'backgammon') return;

            const result = backgammonLogic.applyTurn(game.gameState, moves);

            if (result.error) {
                return console.log(`[Invalid Turn] Game ${gameId}: ${result.error}`);
            }

            // Просто принимаем новое состояние как есть, ничего не вычисляя
            game.gameState = result.newState;
            
            io.in(gameId).emit('gameStateUpdate', game);

            if (result.winner) {
                io.in(gameId).emit('gameOver', { winnerSymbol: result.winner });
            }
        });

        // Обработчик предложения реванша
        socket.on('offerRematch', ({ gameId }) => {
            const game = games[gameId];
            if (!game) return;

            // Находим оппонента, чтобы отправить предложение только ему
            const opponent: any = Object.values(game.players).find((p: any) => p.socketId !== socket.id);
            if (!opponent) return;

            console.log(`[Rematch] Offer from ${socket.id} in game ${gameId}`);

            // Запоминаем, кто предложил, и сразу считаем его согласившимся
            game.rematchInfo = {
                offeredBy: socket.id,
                acceptedBy: [socket.id],
                timer: null
            };

            // Отправляем событие только оппоненту
            io.to(opponent.socketId).emit('rematchOffered');

            // Запускаем таймер на 5 секунд
            if (game.rematchInfo.timer) clearTimeout(game.rematchInfo.timer);
            game.rematchInfo.timer = setTimeout(() => {
                const currentGame = games[gameId];
                if (currentGame && currentGame.rematchInfo.offeredBy) {
                    io.in(gameId).emit('rematchRejected');
                    delete games[gameId];
                }
            }, 5100);
        });

        // Обработчик принятия реванша
        socket.on('acceptRematch', ({ gameId }) => {
            const game = games[gameId];
            if (!game || !game.rematchInfo.offeredBy || game.rematchInfo.acceptedBy.includes(socket.id)) {
                return;
            }

            game.rematchInfo.acceptedBy.push(socket.id);

            // Если согласившихся двое - начинаем реванш
            if (game.rematchInfo.acceptedBy.length === 2) {
                if (game.rematchInfo.timer) clearTimeout(game.rematchInfo.timer);

                const gameModule = gameModules[game.gameType];

                // Сбрасываем состояние игры до начального
                game.gameState = gameModule.getInitialState();
                game.rematchInfo = { offeredBy: null, acceptedBy: [], timer: null };

                // Отправляем обоим игрокам обновленное состояние для начала новой игры
                io.in(gameId).emit('rematchAccepted', game);
            }
        });

        // Обработчик отказа от реванша
        socket.on('rejectRematch', ({ gameId }) => {
            const game = games[gameId];
            if (!game) return;

            if (game.rematchInfo && game.rematchInfo.timer) clearTimeout(game.rematchInfo.timer);

            // Сообщаем обоим игрокам, что реванш отклонен
            io.in(gameId).emit('rematchRejected');
            // Удаляем игру из памяти сервера
            delete games[gameId];
        });

        // Обработчик отмены поиска игры
        socket.on('cancelFindGame', () => {
            console.log(`[CancelSearch] User ${socket.id} cancelled search.`);
            // Удаляем игрока из всех возможных очередей ожидания
            for (const gameType in waitingQueues) {
                // @ts-ignore
                const index = waitingQueues[gameType].findIndex(p => p.socketId === socket.id);
                if (index > -1) {
                    // @ts-ignore
                    waitingQueues[gameType].splice(index, 1);
                    break; // Выходим из цикла, так как игрок может быть только в одной очереди
                }
            }
        });

        // Обработчик отключения сокета (закрытие вкладки, потеря сети)
        socket.on('disconnect', () => {
            console.log(`[Disconnect] User disconnected: ${socket.id}`);

            // Сначала удаляем игрока из очередей, если он там был
            socket.emit('cancelFindGame');

            // Затем ищем, не был ли игрок в активной игре
            let gameToEndId: string | null = null;
            let opponentSocketId: string | null = null;

            for (const gameId in games) {
                const game = games[gameId];
                const players = Object.values(game.players) as any[];

                const disconnectedPlayer = players.find(p => p.socketId === socket.id);
                if (disconnectedPlayer) {
                    gameToEndId = gameId;
                    const opponent = players.find(p => p.socketId !== socket.id);
                    if (opponent) {
                        opponentSocketId = opponent.socketId;
                    }
                    break;
                }
            }

            // Если игрок был в игре, уведомляем оппонента и завершаем игру
            if (gameToEndId && opponentSocketId) {
                console.log(`[GameEnd] Player disconnected from game ${gameToEndId}. Notifying opponent.`);
                // Отправляем оппоненту специальное событие
                io.to(opponentSocketId).emit('opponentDisconnected');
                // Удаляем игру с сервера
                delete games[gameToEndId];
            }
        });

    });
};