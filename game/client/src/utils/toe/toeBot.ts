

// Эта функция будет импортирована в нашу оффлайн-игру
import { calculateWinner } from './toeGameLogic';

export const findBestMove = (board: (string | null)[]): number => {
  const emptySquares = board.map((sq, i) => sq === null ? i : -1).filter(i => i !== -1);
  const player = 'X';
  const bot = 'O';

  // 1. Проверить, может ли бот выиграть следующим ходом
  for (let i of emptySquares) {
    const newBoard = [...board];
    newBoard[i] = bot;
    if (calculateWinner(newBoard) === bot) {
      return i;
    }
  }

  // 2. Проверить, нужно ли блокировать выигрышный ход игрока
  for (let i of emptySquares) {
    const newBoard = [...board];
    newBoard[i] = player;
    if (calculateWinner(newBoard) === player) {
      return i;
    }
  }

  // 3. Занять центр, если он свободен
  const center = 4;
  if (board[center] === null) {
    return center;
  }

  // 4. Занять случайный угол, если он свободен
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(i => board[i] === null);
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  // 5. Занять случайную боковую клетку
  return emptySquares[Math.floor(Math.random() * emptySquares.length)];
};