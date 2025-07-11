import { Chess } from 'chess.js';

/**
 * Возвращает начальное состояние шахматной доски.
 */
export const getInitialState = () => {
    const chess = new Chess();
    return {
        // FEN - стандартная строка, описывающая всю позицию на доске
        boardFen: chess.fen(),
        // currentPlayer нужен для нашей универсальной системы
        currentPlayer: 'w', 
    };
};

/**
 * Принимает текущее состояние игры и ход, возвращает новое состояние или ошибку.
 * @param gameState - Текущее состояние игры { boardFen, currentPlayer }
 * @param move - Объект хода, например { from: 'e2', to: 'e4' }
 */
export const applyMove = (gameState: any, move: { from: string; to: string; promotion?: string }) => {
    try {
        // Загружаем текущую позицию из FEN-строки
        const chess = new Chess(gameState.boardFen);

        // Библиотека chess.js сама проверяет все правила: чей ход, легальность и т.д.
        const moveResult = chess.move(move);

        // Если ход нелегальный, библиотека вернет null
        if (moveResult === null) {
            return { error: `Нелегальный ход.` };
        }

        // Проверяем, закончилась ли игра
        let winner: string | null = null;
        if (chess.isGameOver()) {
            if (chess.isCheckmate()) {
                // Победил тот, кто сделал ход. chess.turn() показывает, чей ход СЛЕДУЮЩИЙ.
                winner = chess.turn() === 'w' ? 'b' : 'w';
            } else {
                // Любой другой конец игры (пат, ничья по материалу и т.д.) - это ничья
                winner = 'draw';
            }
        }
        
        // Возвращаем новое, полностью готовое состояние игры
        return {
            newState: {
                boardFen: chess.fen(),      // Новый FEN
                currentPlayer: chess.turn(), // Новый текущий игрок ('w' или 'b')
            },
            winner
        };

    } catch (e) {
        // На случай непредвиденных ошибок, например, в формате хода
        return { error: "Внутренняя ошибка при обработке хода." };
    }
};