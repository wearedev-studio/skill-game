import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { socket } from '../../socket';
import { useAuth } from '../../context/AuthContext';
import { PageContainer, StyledButton } from '../../styles/StyledComponents';
import GameOverModal from '../../components/GameOverModal';
import TicTacToeBoard from '../../components/game-boards/TicTacToeBoard';
import CheckersBoard from '../../components/game-boards/CheckersBoard';
import BackgammonBoard from '../../components/game-boards/BackgammonBoard';

// --- Стили ---
const GameHeader = styled.div`
  width: 100%;
  max-width: 900px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--dark-surface);
  border-radius: 8px;
`;

const PlayerInfo = styled.div<{ $isActive: boolean }>`
  font-weight: ${props => props.$isActive ? 'bold' : 'normal'};
  color: ${props => props.$isActive ? 'var(--primary-color)' : 'var(--light-text)'};
  transition: all 0.3s ease;
  text-align: center;
  flex: 1;
`;

const GameStatus = styled.h2`
  font-size: 1.5rem;
  text-align: center;
  color: var(--dark-text);
  flex: 0.5;
`;

const ControlsContainer = styled.div`
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  flex-wrap: wrap;
`;

const DiceDisplay = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  background-color: var(--dark-surface);
  padding: 0.5rem 1rem;
  border-radius: 8px;
`;

const TurnError = styled.div`
  color: #ff6b6b; // Ярко-красный
  background-color: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.5);
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
  font-weight: bold;
`;

type RematchStatus = 'none' | 'offered' | 'received';

// --- Основной компонент ---
const OnlineGamePage: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [game, setGame] = useState<any | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [rematchStatus, setRematchStatus] = useState<RematchStatus>('none');
    const [turnError, setTurnError] = useState<string | null>(null); // НОВОЕ СОСТОЯНИЕ ДЛЯ ОШИБКИ

    
    // Состояния для нард
    const [tempGameState, setTempGameState] = useState<any | null>(null);
    const [currentTurnMoves, setCurrentTurnMoves] = useState<any[]>([]);

    useEffect(() => {
        if (!gameId || !user) return;
        const handleGameStateUpdate = (serverState: any) => {
            setGame(serverState);
            if (serverState.gameType === 'backgammon') {
                setTempGameState(serverState.gameState);
                setCurrentTurnMoves([]); 
            }
        };
        const handleGameOver = ({ winnerSymbol }: { winnerSymbol: string | null }) => { setWinner(winnerSymbol); setIsGameOver(true); };
        const handleRematchOffered = () => setRematchStatus('received');
        const handleRematchAccepted = (serverState: any) => { setIsGameOver(false); setWinner(null); setRematchStatus('none'); setGame(serverState); };
        const handleRematchRejected = () => navigate('/profile');
        const handleGameNotFound = () => { alert("Игра не найдена или была завершена."); navigate('/profile'); };
        const handleTurnError = ({ message }: { message: string }) => {
            setTurnError(message);
            // Прячем сообщение через 3 секунды
            setTimeout(() => {
                setTurnError(null);
            }, 3000);
        };

        socket.on('gameStateUpdate', handleGameStateUpdate);
        socket.on('gameOver', handleGameOver);
        socket.on('rematchOffered', handleRematchOffered);
        socket.on('rematchAccepted', handleRematchAccepted);
        socket.on('rematchRejected', handleRematchRejected);
        socket.on('gameNotFound', handleGameNotFound);
        socket.on('turnError', handleTurnError);
        
        socket.emit('requestGameState', gameId);
        return () => {
            socket.off('gameStateUpdate', handleGameStateUpdate);
            socket.off('gameOver', handleGameOver);
            socket.off('rematchOffered', handleRematchOffered);
            socket.off('rematchAccepted', handleRematchAccepted);
            socket.off('rematchRejected', handleRematchRejected);
            socket.off('gameNotFound', handleGameNotFound);
            socket.off('turnError', handleTurnError);
        };
    }, [gameId, user, navigate]);

    const playerSymbol = useMemo(() => {
        if (!game || !user) return null;
        const symbol = Object.keys(game.players).find(key => game.players[key]?._id.toString() === user._id.toString());
        return symbol as any;
    }, [game, user]);
    
    const isMyTurn = useMemo(() => game?.gameState.currentPlayer === playerSymbol, [game, playerSymbol]);

    const handleMove = (moveData: any) => {
        if (!game) return;
        if (game.gameType === 'backgammon') {
            if (!tempGameState || !isMyTurn || tempGameState.dice.length === 0) return;
            const tempBoard = JSON.parse(JSON.stringify(tempGameState.board));
            const usedDie = Math.abs(moveData.to - moveData.from);
            const remainingDice = [...tempGameState.dice];
            const dieIndex = remainingDice.indexOf(usedDie);
            if (dieIndex === -1) return;
            remainingDice.splice(dieIndex, 1);
            
            tempBoard[moveData.from]!.count--;
            if (tempBoard[moveData.from]!.count === 0) tempBoard[moveData.from] = null;
            if (!tempBoard[moveData.to]) tempBoard[moveData.to] = { color: playerSymbol, count: 0 };
            tempBoard[moveData.to]!.count++;

            setTempGameState({ ...tempGameState, board: tempBoard, dice: remainingDice });
            setCurrentTurnMoves(prev => [...prev, moveData]);
        } else {
            let moveToSend = { ...moveData };
            if (game.gameType === 'tic-tac-toe') moveToSend.playerSymbol = playerSymbol;
            socket.emit('makeMove', { gameId, move: moveToSend });
        }
    };

    // Функции для нард
    const handleRollDice = () => socket.emit('rollDice', { gameId });
    const handleSubmitTurn = () => socket.emit('submitTurn', { gameId, moves: currentTurnMoves });
    const handleResetTurn = () => {
        setTempGameState(game.gameState);
        setCurrentTurnMoves([]);
    };
    
    const handleOfferRematch = () => { setRematchStatus('offered'); socket.emit('offerRematch', { gameId }); };
    const handleAcceptRematch = () => socket.emit('acceptRematch', { gameId });
    const handleRejectRematch = () => socket.emit('rejectRematch', { gameId });

    if (!game || !user || (game.gameType === 'backgammon' && !tempGameState)) {
        return <PageContainer><h2>Загрузка...</h2></PageContainer>;
    }

    const { gameState, players, gameType } = game;
    
    const renderGameBoard = () => {
        if (!playerSymbol) return <h2>Определение вашей роли...</h2>;
        const props = {
            gameState: gameType === 'backgammon' ? tempGameState : gameState,
            playerSymbol,
            onMove: handleMove,
            gameId,
        };
        switch (gameType) {
            case 'tic-tac-toe': return <TicTacToeBoard {...props as any} />;
            case 'checkers': return <CheckersBoard {...props as any} />;
            case 'backgammon': return <BackgammonBoard {...props as any} />;
            default: return <h2>Игра не найдена</h2>;
        }
    };
    
    const p1Symbol = (gameType === 'tic-tac-toe') ? 'X' : 'w';
    const p2Symbol = (gameType === 'tic-tac-toe') ? 'O' : 'b';
    const player1 = players[p1Symbol];
    const player2 = players[p2Symbol];

    return (
        <PageContainer>
            <GameHeader>
                <PlayerInfo $isActive={gameState.currentPlayer === p1Symbol}>
                    {player1?.username} ({gameType === 'tic-tac-toe' ? 'X' : 'Белые'})
                </PlayerInfo>
                <GameStatus>VS</GameStatus>
                <PlayerInfo $isActive={gameState.currentPlayer === p2Symbol}>
                    {player2?.username} ({gameType === 'tic-tac-toe' ? 'O' : 'Черные'})
                </PlayerInfo>
            </GameHeader>

            {renderGameBoard()}
            
            {game.gameType === 'backgammon' && tempGameState && (
                <ControlsContainer>
                    {/* Кнопка для первого броска, когда еще не определен ходящий */}
                    {gameState.currentPlayer === null && (
                        <StyledButton onClick={handleRollDice}>Бросить кости, чтобы начать</StyledButton>
                    )}

                    {/* Кнопка для обычного броска в свой ход */}
                    {isMyTurn && gameState.dice.length === 0 && gameState.currentPlayer !== null && (
                        <StyledButton onClick={handleRollDice}>Бросить кости</StyledButton>
                    )}

                    {/* Отображение костей */}
                    {tempGameState.dice.length > 0 && (
                        <DiceDisplay>Ваш бросок: {tempGameState.dice.join(' - ')}</DiceDisplay>
                    )}

                    {/* Кнопки управления ходом */}
                    {currentTurnMoves.length > 0 && (
                        <StyledButton onClick={handleResetTurn} style={{backgroundColor: '#c4a70a'}}>Сбросить ход</StyledButton>
                    )}
                    {isMyTurn && tempGameState.dice.length < game.gameState.dice.length && (
                         <StyledButton onClick={handleSubmitTurn} style={{backgroundColor: '#4caf50'}}>
                            Завершить ход
                        </StyledButton>
                    )}
                </ControlsContainer>
            )}

            {turnError && (
                <TurnError>{turnError}</TurnError>
            )}
            
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