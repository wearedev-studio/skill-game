import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { socket } from '../../socket';
import { useAuth } from '../../context/AuthContext';
import { PageContainer } from '../../styles/StyledComponents';
import GameOverModal from '../../components/GameOverModal';

// --- НАЧАЛО ВОССТАНОВЛЕННЫХ СТИЛЕЙ ---

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

// --- КОНЕЦ ВОССТАНОВЛЕННЫХ СТИЛЕЙ ---

type RematchStatus = 'none' | 'offered' | 'received';


const GamePage: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Состояния игры
    const [players, setPlayers] = useState<any | null>(null);
    const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState<string>('X');
    const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);
    
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);

    const [rematchStatus, setRematchStatus] = useState<RematchStatus>('none');



    useEffect(() => {
        if (!gameId || !user) { navigate('/'); return; }

        // Запрашиваем состояние игры при загрузке
        socket.emit('requestGameState', gameId);

        // Главный слушатель, обновляющий все
        const handleGameStateUpdate = (serverState: any) => {
            console.log("Received game state update:", serverState);
            setPlayers(serverState.players);
            setBoard(serverState.board);
            setCurrentPlayer(serverState.currentPlayer);
            
            const symbol = Object.keys(serverState.players).find(key => serverState.players[key]?._id === user?._id) as 'X' | 'O';
            setPlayerSymbol(symbol);
        };
        
        const handleGameOver = ({ winnerSymbol }: { winnerSymbol: string | null }) => {
            setWinner(winnerSymbol);
            setIsGameOver(true);
        };
        
        const handleRematchOffered = () => setRematchStatus('received');

        const handleRematchAccepted = (gameState: any) => {
            setIsGameOver(false);
            setWinner(null);
            setRematchStatus('none'); // Сбрасываем статус реванша
            handleGameStateUpdate(gameState);
        };
        
        const handleRematchRejected = () => {
            console.log('Rematch rejected by server. Navigating to profile.');
            navigate('/profile');
        };

        const handleGameNotFound = () => navigate('/find-game');

        // Подписываемся на события
        socket.on('gameStateUpdate', handleGameStateUpdate);
        socket.on('gameOver', handleGameOver);
        socket.on('rematchOffered', handleRematchOffered);
        socket.on('rematchAccepted', handleRematchAccepted);
        socket.on('rematchRejected', handleRematchRejected);
        socket.on('gameNotFound', handleGameNotFound);

        // Отписка при уходе со страницы
        return () => {
            socket.off('gameStateUpdate', handleGameStateUpdate);
            socket.off('gameOver', handleGameOver);
            socket.off('rematchOffered', handleRematchOffered);
            socket.off('rematchAccepted', handleRematchAccepted);
            socket.off('rematchRejected', handleRematchRejected);
            socket.off('gameNotFound', handleGameNotFound);
        };
    }, [gameId, user, navigate]);


    // Функции для модального окна
     const handleOfferRematch = () => {
        socket.emit('offerRematch', { gameId });
        setRematchStatus('offered'); // Меняем свой статус на "предложено"
    };

    const handleAcceptRematch = () => socket.emit('acceptRematch', { gameId });
    const handleRejectRematch = () => socket.emit('rejectRematch', { gameId });

    const handleSquareClick = (index: number) => {
        if (!playerSymbol || board[index] || winner || currentPlayer !== playerSymbol) return;
        socket.emit('makeMove', { gameId, index, playerSymbol });
    };

    // Логика отображения
    if (!players) {
        return <PageContainer><h2>Загрузка игры...</h2></PageContainer>;
    }

    const isMyTurn = currentPlayer === playerSymbol && !isGameOver;
    let status = isGameOver ? "Игра окончена" : isMyTurn ? "Ваш ход" : "Ход оппонента";

    return (
        <PageContainer>
            <GameStatus>{status}</GameStatus>
            <BoardGrid>
                {board.map((value, i) => (
                    <SquareButton key={i} onClick={() => handleSquareClick(i)} disabled={!!value || !!winner || !isMyTurn}>
                        {value}
                    </SquareButton>
                ))}
            </BoardGrid>
            {isGameOver && (
                <GameOverModal
                    isWinner={winner === playerSymbol}
                    rematchStatus={rematchStatus} // Передаем новый статус
                    onOfferRematch={handleOfferRematch}
                    onAcceptRematch={handleAcceptRematch}
                    onRejectRematch={handleRejectRematch}
                />
            )}
        </PageContainer>
    );
};

export default GamePage;