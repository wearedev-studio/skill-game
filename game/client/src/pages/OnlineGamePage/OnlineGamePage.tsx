import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { socket } from '../../socket';
import { useAuth } from '../../context/AuthContext';
import { PageContainer } from '../../styles/StyledComponents';
import GameOverModal from '../../components/GameOverModal';
import TicTacToeBoard from '../../components/game-boards/TicTacToeBoard';
import CheckersBoard from '../../components/game-boards/CheckersBoard';

// Стили для отображения информации об игре
const GameHeader = styled.div`
  width: 100%;
  max-width: 520px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--dark-surface);
  border-radius: 8px;
`;

const PlayerInfo = styled.div<{ isActive: boolean }>`
  font-weight: ${props => props.isActive ? 'bold' : 'normal'};
  color: ${props => props.isActive ? 'var(--primary-color)' : 'var(--light-text)'};
  transition: all 0.3s ease;
`;

const GameStatus = styled.h2`
  font-size: 1.5rem;
  text-align: center;
`;

type RematchStatus = 'none' | 'offered' | 'received';

const OnlineGamePage: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Основное состояние, получаемое от сервера
    const [game, setGame] = useState<any | null>(null);

    // Локальные состояния UI
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [rematchStatus, setRematchStatus] = useState<RematchStatus>('none');

    useEffect(() => {
        if (!gameId || !user) {
            navigate('/');
            return;
        }

        // При входе на страницу запрашиваем актуальное состояние игры
        socket.emit('requestGameState', gameId);

        // --- Обработчики событий от сервера ---
        const handleGameStateUpdate = (serverState: any) => {
            setGame(serverState);
        };

        const handleGameOver = ({ winnerSymbol }: { winnerSymbol: string | null }) => {
            console.log("Game Over! Winner:", winnerSymbol);
            setWinner(winnerSymbol);
            setIsGameOver(true);
        };
        
        const handleRematchOffered = () => {
            console.log("Rematch offer received.");
            setRematchStatus('received');
        };

        const handleRematchAccepted = (serverState: any) => {
            console.log("Rematch accepted. Resetting game.");
            setIsGameOver(false);
            setWinner(null);
            setRematchStatus('none');
            setGame(serverState);
        };
        
        const handleRematchRejected = () => {
            console.log("Rematch rejected. Navigating to profile.");
            navigate('/profile');
        };

        const handleGameNotFound = () => navigate('/find-game');

        socket.on('gameStateUpdate', handleGameStateUpdate);
        socket.on('gameOver', handleGameOver);
        socket.on('rematchOffered', handleRematchOffered);
        socket.on('rematchAccepted', handleRematchAccepted);
        socket.on('rematchRejected', handleRematchRejected);
        socket.on('gameNotFound', handleGameNotFound);

        return () => {
            socket.off('gameStateUpdate', handleGameStateUpdate);
            socket.off('gameOver', handleGameOver);
            socket.off('rematchOffered', handleRematchOffered);
            socket.off('rematchAccepted', handleRematchAccepted);
            socket.off('rematchRejected', handleRematchRejected);
            socket.off('gameNotFound', handleGameNotFound);
        };
    }, [gameId, user, navigate]);

    // --- Функции-действия, передаваемые в дочерние компоненты ---
     const handleMove = (move: any) => {
        // Для крестиков-ноликов серверу нужен символ игрока в объекте хода.
        // Для шашек объект хода другой ({ from, to }), поэтому эта логика им не мешает.
        if (game.gameType === 'tic-tac-toe') {
            // Добавляем символ текущего игрока к объекту хода
            move.playerSymbol = playerSymbol;
        }
        socket.emit('makeMove', { gameId, move });
    };

    const handleOfferRematch = () => {
        socket.emit('offerRematch', { gameId });
        setRematchStatus('offered');
    };
    
    const handleAcceptRematch = () => { socket.emit('acceptRematch', { gameId }); };
    
    // Эта функция будет вызываться кнопкой "Не хочу" или "Отказаться"
    const handleRejectRematch = () => { socket.emit('rejectRematch', { gameId }); };


    // --- Логика отрисовки ---
    if (!game || !user) {
        return <PageContainer><h2>Загрузка игры...</h2></PageContainer>;
    }

    const { gameState, players, gameType } = game;

    const symbol = Object.keys(players).find(key => players[key]?._id === user._id);
    const playerSymbol = (symbol === 'X' || symbol === 'O' || symbol === 'w' || symbol === 'b') ? symbol : null;
    
    // Определяем символ/цвет текущего игрока, чтобы передать его в модальное окно
    const playerX_or_W = players['X'] || players['w'];
    const playerO_or_B = players['O'] || players['b'];

        const renderGameBoard = () => {
        // --- НАЧАЛО ИЗМЕНЕНИЙ ---
        const boardProps = {
            gameState: game.gameState,
            playerSymbol: playerSymbol, // Передаем вычисленный символ
            onMove: handleMove,
        };

        // Проверяем, что символ определен, прежде чем рендерить доску
        if (!playerSymbol) {
            return <h2>Определение вашей роли...</h2>;
        }

        switch (game.gameType) {
            case 'tic-tac-toe':
                // @ts-ignore // Временно игнорируем несоответствие типов для простоты
                return <TicTacToeBoard {...boardProps} />;
            case 'checkers':
                 // @ts-ignore
                return <CheckersBoard {...boardProps} />;
            default:
                return <h2>Неизвестный тип игры: {gameType}</h2>;
        }
        // --- КОНЕЦ ИЗМЕНЕНИЙ ---
    };
    
    return (
       <PageContainer>
            <GameHeader>
                <PlayerInfo isActive={gameState.currentPlayer === (gameType === 'checkers' ? 'w' : 'X')}>
                    {playerX_or_W.username} ({gameType === 'checkers' ? 'Белые' : 'X'})
                </PlayerInfo>
                <GameStatus>VS</GameStatus>
                <PlayerInfo isActive={gameState.currentPlayer === (gameType === 'checkers' ? 'b' : 'O')}>
                    {playerO_or_B.username} ({gameType === 'checkers' ? 'Черные' : 'O'})
                </PlayerInfo>
            </GameHeader>

            {renderGameBoard()}

            {/* Теперь эта проверка абсолютно корректна */}
            {isGameOver && playerSymbol && (
                <GameOverModal
                    winnerSymbol={winner}
                    playerSymbol={playerSymbol}
                    rematchStatus={rematchStatus}
                    onOfferRematch={handleOfferRematch}
                    onAcceptRematch={handleAcceptRematch}
                    onRejectRematch={handleRejectRematch}
                />
            )}
        </PageContainer>
    );
};

export default OnlineGamePage;