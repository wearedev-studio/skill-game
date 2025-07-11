import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { socket } from '../../socket';
import { PageContainer } from '../../styles/StyledComponents';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
`;

const FindGamePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Проверяем наличие пользователя. Если его нет, переходим на страницу входа.
        if (!user) {
            navigate('/login');
            return;
        }

        // Получаем тип игры из состояния навигации
        const gameType = location.state?.gameType || 'tic-tac-toe';

        // Определяем функцию-обработчик для события 'gameFound'
        const onGameFound = ({ gameId }: { gameId: string }) => {
            // Переходим на страницу игры, как только сервер нашел нам пару
            navigate(`/game/${gameId}`);
        };

        // Подписываемся на событие от сервера
        socket.on('gameFound', onGameFound);
        
        // Отправляем на сервер запрос на поиск игры
        socket.emit('findGame', { user, gameType });

        // Функция очистки, которая сработает только при уходе со страницы
        return () => {
            // При уходе мы отписываемся от 'gameFound' и отправляем отмену поиска.
            // Это очень важно, чтобы не остаться в очереди "призраком".
            socket.off('gameFound', onGameFound);
            socket.emit('cancelFindGame');
        };
    // --- ГЛАВНОЕ ИСПРАВЛЕНИЕ: ПУСТОЙ МАССИВ ЗАВИСИМОСТЕЙ ---
    // Это гарантирует, что эффект запустится один раз при монтировании
    // и очистится один раз при размонтировании (когда вы уходите со страницы).
    }, []);

    return (
        <PageContainer>
            <Spinner />
            <h2 style={{ marginTop: '1.5rem' }}>Поиск оппонента...</h2>
        </PageContainer>
    );
};

export default FindGamePage;