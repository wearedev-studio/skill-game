// Логика, специфичная для Крестиков-Ноликов
export const getInitialState = () => ({
    board: Array(9).fill(null),
    currentPlayer: 'X',
});

export const applyMove = (gameState: any, move: any) => {
    // move для крестиков-ноликов - это просто { index, playerSymbol }
    if (gameState.board[move.index] || calculateWinner(gameState.board) || gameState.currentPlayer !== move.playerSymbol) {
        return { error: "Invalid move" };
    }
    
    const newBoard = [...gameState.board];
    newBoard[move.index] = gameState.currentPlayer;

    const winner = calculateWinner(newBoard);

    return {
        newState: {
            board: newBoard,
            currentPlayer: gameState.currentPlayer === 'X' ? 'O' : 'X',
        },
        winner,
    };
};

export function calculateWinner(squares: (string | null)[]) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]; // Возвращает 'X' или 'O' при победе
      }
    }
    // Если все клетки заняты и победителя нет - это ничья
    return squares.every(square => square) ? 'draw' : null;
}