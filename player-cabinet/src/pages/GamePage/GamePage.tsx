import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../../socket';
import Board from '../../components/Board/Board';

const GamePage = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
    const [message, setMessage] = useState('Игра начинается...');

    useEffect(() => {
        // Убедимся, что мы подключены
        if (!socket.connected) {
            socket.connect();
        }

        // Обработчик обновления состояния игры от сервера
        const onGameStateUpdate = (newBoard: (string | null)[]) => {
            setBoard(newBoard);
            // Здесь можно добавить логику определения, чей ход
        };

        const onGameOver = ({ winner }: { winner: string }) => {
            if (winner === 'draw') {
                setMessage('Ничья!');
            } else {
                // Определяем, является ли текущий игрок победителем
                const playerSymbol = socket.id === winner ? 'Вы' : 'Соперник';
                setMessage(`${playerSymbol} победил!`);
            }
        };

        socket.on('gameStateUpdate', onGameStateUpdate);
        socket.on('gameOver', onGameOver);

        return () => {
            socket.off('gameStateUpdate', onGameStateUpdate);
            // Не отключаемся, чтобы можно было начать новую игру из лобби
            socket.off('gameOver', onGameOver);
        };
    }, []);

    const handleSquareClick = (index: number) => {
        // Отправляем ход на сервер
        console.log({ gameId, index });
        socket.emit('makeMove', { gameId, index });
    };

    return (
        <div>
            <h2>Игра: Крестики-нолики</h2>
            <h3>ID Игры: {gameId}</h3>
            <p>{message}</p>
            <Board board={board} onSquareClick={handleSquareClick} />
        </div>
    );
};

export default GamePage;