import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../../socket';

import { Header } from '../../components/Header/Header';

const LobbyPage = () => {
  const [status, setStatus] = useState('Готов к игре');
  const navigate = useNavigate();

  useEffect(() => {
    // Подключаемся к сокет-серверу при входе в лобби
    socket.connect();

    function onMatchFound(data: { gameId: string }) {
      setStatus(`Игра найдена! ID: ${data.gameId}`);
      navigate(`/game/${data.gameId}`);
    }

    function onWaiting() {
      setStatus('Ожидание соперника...');
    }

    // Начинаем слушать события
    socket.on('matchFound', onMatchFound);
    socket.on('waitingForOpponent', onWaiting);

    // Очистка при выходе со страницы
    return () => {
      socket.off('matchFound', onMatchFound);
      socket.off('waitingForOpponent', onWaiting);
      socket.disconnect();
    };
  }, [navigate]);

  const handleFindMatch = () => {
    setStatus('Поиск игры...');
    socket.emit('findMatch');
  };

  return (
    <>
      <Header />
      <div style={{ padding: '1rem' }}>
        <h2>Игровое Лобби</h2>
        <p>Статус: {status}</p>
        <button onClick={handleFindMatch} disabled={status !== 'Готов к игре'}>
          Найти игру (Крестики-нолики)
        </button>
      </div>
    </>
  );
};

export default LobbyPage;