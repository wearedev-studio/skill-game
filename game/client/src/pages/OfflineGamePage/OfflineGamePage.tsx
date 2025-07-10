import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PageContainer, StyledButton } from '../../styles/StyledComponents';
import { calculateWinner } from '../../utils/toe/toeGameLogic';
import { findBestMove } from '../../utils/toe/toeBot';

// --- НАЧАЛО ПОЛНЫХ ОПРЕДЕЛЕНИЙ СТИЛЕЙ ---

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

// --- КОНЕЦ ПОЛНЫХ ОПРЕДЕЛЕНИЙ СТИЛЕЙ ---

const initialBoard = Array(9).fill(null);

const OfflineGamePage: React.FC = () => {
    const [board, setBoard] = useState<(string | null)[]>(initialBoard);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [winner, setWinner] = useState<string | null>(null);

    const handlePlayerMove = (index: number) => {
        if (!isPlayerTurn || board[index] || winner) return;

        const newBoard = [...board];
        newBoard[index] = 'X';
        setBoard(newBoard);
        setIsPlayerTurn(false);

        const newWinner = calculateWinner(newBoard);
        if (newWinner) {
            setWinner(newWinner);
        }
    };
    
    // Эффект для хода бота
    useEffect(() => {
        if (!isPlayerTurn && !winner) {
            // Делаем ход бота с небольшой задержкой для имитации "размышлений"
            const botMoveTimeout = setTimeout(() => {
                const bestMove = findBestMove(board);
                const newBoard = [...board];
                newBoard[bestMove] = 'O';
                setBoard(newBoard);
                setIsPlayerTurn(true);

                const newWinner = calculateWinner(newBoard);
                if (newWinner) {
                    setWinner(newWinner);
                }
            }, 700);

            return () => clearTimeout(botMoveTimeout);
        }
    }, [isPlayerTurn, board, winner]);

    const resetGame = () => {
        setBoard(initialBoard);
        setWinner(null);
        setIsPlayerTurn(true);
    };
    
    let status;
    if (winner) {
        if (winner === 'draw') status = 'Ничья!';
        else if (winner === 'X') status = 'Вы победили!';
        else status = 'Вы проиграли!';
    } else {
        status = isPlayerTurn ? 'Ваш ход' : 'Ход бота...';
    }

    return (
        <PageContainer>
            <GameStatus>{status}</GameStatus>
            <BoardGrid>
                {board.map((value, i) => (
                    <SquareButton key={i} onClick={() => handlePlayerMove(i)} disabled={!isPlayerTurn || !!value || !!winner}>
                        {value}
                    </SquareButton>
                ))}
            </BoardGrid>
            {winner && (
                <StyledButton onClick={resetGame} style={{ marginTop: '2rem' }}>
                    Играть снова
                </StyledButton>
            )}
        </PageContainer>
    );
};

export default OfflineGamePage;