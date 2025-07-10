// server/src/game-logic/checkers.ts

type Piece = 'w' | 'b' | 'W' | 'B';
type Player = 'w' | 'b';
type Board = (Piece | null)[];
type Move = { from: number; to: number };

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

// Проверяет, является ли фигура фигурой указанного игрока
const isOwnPiece = (piece: Piece, player: Player) => piece.toLowerCase() === player;

const getOpponent = (player: Player) => (player === 'w' ? 'b' : 'w');

// Находит все возможные ходы (простые и взятия) для одной шашки
const findMovesForPiece = (board: Board, index: number): { from: number, to: number, isCapture: boolean }[] => {
    const piece = board[index];
    if (!piece) return [];

    const moves: { from: number, to: number, isCapture: boolean }[] = [];
    const player = piece.toLowerCase() as Player;
    const directions = [-9, -7, 7, 9];
    const isKing = piece === 'W' || piece === 'B';

    for (const dir of directions) {
        // Логика для простых шашек
        if (!isKing) {
            // 1. Простой ход (только вперед)
            if ((player === 'w' && dir < 0) || (player === 'b' && dir > 0)) {
                const to = index + dir;
                if (to >= 0 && to < 64 && !board[to] && Math.abs((index % 8) - (to % 8)) === 1) {
                    moves.push({ from: index, to, isCapture: false });
                }
            }
            
            // 2. Ход со взятием (в любую сторону)
            const capturedIndex = index + dir;
            const jumpTo = index + 2 * dir;
            if (jumpTo >= 0 && jumpTo < 64 && !board[jumpTo] && board[capturedIndex] && !isOwnPiece(board[capturedIndex]!, player) && Math.abs((index % 8) - (jumpTo % 8)) === 2) {
                moves.push({ from: index, to: jumpTo, isCapture: true });
            }
        } else { // Логика для Дамок
            for (let i = 1; i < 8; i++) {
                const to = index + dir * i;
                if (to < 0 || to >= 64 || Math.abs((to % 8) - (index % 8)) !== i) break;

                const target = board[to];
                if (!target) {
                    // Дамка может ходить на любую пустую клетку по диагонали
                    moves.push({ from: index, to, isCapture: false });
                } else {
                    // Если на пути фигура
                    if (isOwnPiece(target, player)) break; // Своя фигура - путь закрыт

                    // Чужая фигура - проверяем возможность взятия через нее
                    const jumpTo = to + dir;
                    if (jumpTo >= 0 && jumpTo < 64 && !board[jumpTo] && Math.abs((to % 8) - (jumpTo % 8)) === 1) {
                        moves.push({ from: index, to: jumpTo, isCapture: true });
                    }
                    // В любом случае, после первой встреченной фигуры (своей или чужой) путь для простых ходов закрыт
                    break;
                }
            }
        }
    }
    return moves;
};


const findAllCaptures = (board: Board, player: Player): Move[] => {
    const allMoves: { from: number; to: number; isCapture: boolean }[] = [];
    for (let i = 0; i < 64; i++) {
        if (board[i] && isOwnPiece(board[i]!, player)) {
            allMoves.push(...findMovesForPiece(board, i));
        }
    }
    return allMoves.filter(move => move.isCapture);
};

// Проверяет, является ли ход по диагонали
const isDiagonalMove = (from: number, to: number, distance: number) => {
    return Math.abs(Math.floor(from / 8) - Math.floor(to / 8)) === distance &&
           Math.abs((from % 8) - (to % 8)) === distance;
};

// Проверяет направление хода для простой шашки
const isCorrectDirection = (piece: Piece, from: number, to: number) => {
    if (piece === 'w') return to < from; // Белые ходят вверх (к меньшим индексам)
    if (piece === 'b') return to > from; // Черные ходят вниз (к большим индексам)
    return true; // Дамки ходят в любом направлении
};

// Находит все возможные взятия для игрока
const findPossibleCaptures = (board: Board, player: Player): {from: number, to: number}[] => {
    const captures: {from: number, to: number}[] = [];
    for (let i = 0; i < 64; i++) {
        const piece = board[i];
        if (piece && isOwnPiece(piece, player)) {
            const row = Math.floor(i / 8);
            const col = i % 8;

            // Проверяем 4 диагональных направления для взятия
            const directions = [-9, -7, 7, 9]; // Смещения для диагоналей
            for (const dir of directions) {
                const capturedIndex = i + dir;
                const to = i + 2 * dir;
                
                // Условия для взятия
                if (board[to] === null && board[capturedIndex] && !isOwnPiece(board[capturedIndex]!, player)) {
                    if(isDiagonalMove(i, to, 2)) {
                        captures.push({ from: i, to });
                    }
                }
            }
        }
    }
    return captures;
};


// --- ОСНОВНЫЕ ФУНКЦИИ ИГРЫ ---

export const getInitialState = () => {
    const board: Board = Array(64).fill(null);
    for (let i = 0; i < 64; i++) {
        const row = Math.floor(i / 8);
        const col = i % 8;
        if ((row + col) % 2 !== 0) { // Только на темных клетках
            if (row < 3) board[i] = 'b';
            if (row > 4) board[i] = 'w';
        }
    }
    return {
        board,
        currentPlayer: 'w' as Player, // Белые ходят первыми
        lastMove: null as {from: number, to: number} | null, // Для отслеживания мульти-взятий
    };
};

export const applyMove = (gameState: any, move: Move) => {
    let { board, currentPlayer } = gameState;
    const { from, to } = move;

    const allPlayerMoves = findMovesForPiece(board, from);
    const theMove = allPlayerMoves.find(m => m.to === to);
    if (!theMove) return { error: "Move is not valid" };

    const possibleCaptures = findAllCaptures(board, currentPlayer);
    if (possibleCaptures.length > 0 && !theMove.isCapture) {
        return { error: "A capture is mandatory" };
    }
    
    const newBoard = [...board];
    const pieceToMove = newBoard[from];
    newBoard[to] = pieceToMove;
    newBoard[from] = null;
    let newCurrentPlayer = currentPlayer;

    // --- НАЧАЛО ИСПРАВЛЕННОЙ ЛОГИКИ ВЗЯТИЯ ---
    if (theMove.isCapture) {
        let capturedIndex = -1;
        // Определяем направление хода (например, -7, -9, 7 или 9)
        const rowDiff = Math.floor(to / 8) - Math.floor(from / 8);
        const colDiff = (to % 8) - (from % 8);
        const dir = (rowDiff / Math.abs(rowDiff)) * 8 + (colDiff / Math.abs(colDiff));

        // Идем от начальной позиции в направлении хода и ищем фигуру для удаления
        let currentPos = from + dir;
        while (currentPos !== to) {
            if (board[currentPos]) { // Находим первую (и единственную) фигуру на пути
                capturedIndex = currentPos;
                break;
            }
            currentPos += dir;
        }

        if (capturedIndex !== -1) {
            newBoard[capturedIndex] = null;
        }
    }
    // --- КОНЕЦ ИСПРАВЛЕННОЙ ЛОГИКИ ВЗЯТИЯ ---
    
    // Превращение в дамку
    const endRow = Math.floor(to / 8);
    if ((pieceToMove === 'w' && endRow === 0) || (pieceToMove === 'b' && endRow === 7)) {
        newBoard[to] = pieceToMove.toUpperCase() as Piece;
    }

    // Проверка на мульти-взятие
    if (theMove.isCapture && findMovesForPiece(newBoard, to).some(m => m.isCapture)) {
        newCurrentPlayer = currentPlayer;
    } else {
        newCurrentPlayer = getOpponent(currentPlayer);
    }
    
    // Проверка на конец игры
    let winner = null;
    const opponentColor = newCurrentPlayer;
    const opponentPiecesIndexes = [];
    for(let i=0; i<64; i++) {
        if(newBoard[i] && isOwnPiece(newBoard[i]!, opponentColor)) {
            opponentPiecesIndexes.push(i);
        }
    }
    
    if (opponentPiecesIndexes.length === 0) {
        winner = currentPlayer;
    } else {
        let opponentHasMoves = false;
        for (const index of opponentPiecesIndexes) {
            if (findMovesForPiece(newBoard, index).length > 0) {
                opponentHasMoves = true;
                break;
            }
        }
        if (!opponentHasMoves) {
            winner = currentPlayer;
        }
    }

    return { newState: { board: newBoard, currentPlayer: newCurrentPlayer }, winner };
};