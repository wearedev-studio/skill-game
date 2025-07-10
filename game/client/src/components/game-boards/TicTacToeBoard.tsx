import React from 'react';
import styled from 'styled-components';

// --- Стили для доски и кнопок ---
// Эти стили специфичны для крестиков-ноликов и живут здесь.

const GameStatus = styled.h2`
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  min-height: 32px;
  font-size: 1.5rem;
  text-align: center;
`;

const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 300px;
  height: 300px;
  gap: 10px;
`;

const SquareButton = styled.button`
  width: 100%;
  height: 100%;
  background-color: var(--dark-surface);
  border: none;
  border-radius: 8px;
  font-size: 3rem;
  font-weight: bold;
  color: var(--light-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover:enabled {
    background-color: #4a505c;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

// --- Интерфейс для пропсов ---
// Описываем, какие данные компонент ожидает от родителя
interface TicTacToeBoardProps {
    gameState: {
        board: (string | null)[];
        currentPlayer: 'X' | 'O';
    };
    playerSymbol: 'X' | 'O'; // Теперь мы получаем символ напрямую
    onMove: (move: { index: number }) => void;
}

// --- Сам компонент ---

const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({ gameState, playerSymbol, onMove }) => {
    // 1. Получаем все необходимые данные из пропсов
    const { board, currentPlayer } = gameState;

    // 2. Определяем роль текущего пользователя ('X' или 'O').
    // На сервере мы договорились, что p1 - это всегда игрок, который начинает как 'X'.
    const isMyTurn = playerSymbol === currentPlayer;
    
    const handleSquareClick = (index: number) => {
        // Просто сообщаем о ходе, символ больше передавать не нужно
        onMove({ index });
    };

    const status = isMyTurn ? 'Ваш ход' : 'Ход оппонента';

    // 5. Отрисовываем UI на основе полученных данных.
    return (
        <div>
            <GameStatus>{status}</GameStatus>
            <BoardGrid>
                 {board.map((value, i) => (
                    <SquareButton
                        key={i}
                        onClick={() => handleSquareClick(i)}
                        disabled={!isMyTurn || !!value}
                    >
                        {value}
                    </SquareButton>
                ))}
            </BoardGrid>
        </div>
    );
};

export default TicTacToeBoard;