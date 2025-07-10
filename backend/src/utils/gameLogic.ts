export function checkWinner(board: (string | null)[]): string | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Горизонтали
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Вертикали
    [0, 4, 8], [2, 4, 6]             // Диагонали
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      console.log(board[a]);
      return board[a]; // Возвращаем 'X' или 'O'
    }
  }

  // Проверка на ничью
  if (board.every(square => square !== null)) {
    return 'draw';
  }

  return null; // Игра продолжается
}