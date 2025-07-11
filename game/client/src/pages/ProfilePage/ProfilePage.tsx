import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { PageContainer, StyledButton } from '../../styles/StyledComponents';

// Стили (без изменений)
const ProfileCard = styled.div`
  width: 100%;
  max-width: 500px;
  padding: 2.5rem;
  background-color: var(--dark-surface);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;
const ProfileAvatar = styled.img`/* ... */`;
const ProfileDetails = styled.div`/* ... */`;
const UserName = styled.h2`/* ... */`;
const UserEmail = styled.p`/* ... */`;
const UserBalance = styled.p`/* ... */`;

// --- УЛУЧШЕННЫЕ СТИЛИ ДЛЯ ГРУППЫ КНОПОК ---
const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row; // Ставим кнопки в ряд
  gap: 0.75rem;
  align-items: center;
`;

const SecondaryButton = styled(StyledButton)`
  background-color: var(--dark-surface);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  &:hover {
    background-color: rgba(97, 218, 251, 0.1);
  }
`;

const GameSelection = styled.div`/* ... */`;
const GameCard = styled.div`/* ... */`;
const GameTitle = styled.h3`/* ... */`;


const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // --- 1. РАСШИРЯЕМ ТИП ДЛЯ ШАХМАТ ---
    const handlePlayOnline = (gameType: 'tic-tac-toe' | 'checkers' | 'backgammon' | 'chess') => {
        navigate('/find-game', { state: { gameType } });
    };

    const handlePlayOffline = (gameType: 'tic-tac-toe' | 'checkers' | 'backgammon' | 'chess') => {
        navigate(`/offline-game/${gameType}`);
    };

    if (!user) {
        return <PageContainer><p>Загрузка профиля...</p></PageContainer>;
    }

    return (
        <PageContainer>
            <ProfileCard>
                <ProfileAvatar src={user.avatar} alt={`Аватар ${user.username}`} />
                <ProfileDetails>
                    <UserName>{user.username}</UserName>
                    <UserEmail>{user.email}</UserEmail>
                    <UserBalance>Баланс: {user.balance} 💰</UserBalance>
                </ProfileDetails>
                
                <GameSelection>
                    <GameCard>
                        <GameTitle>Крестики-нолики</GameTitle>
                        <ButtonGroup>
                            <StyledButton onClick={() => handlePlayOnline('tic-tac-toe')}>Онлайн</StyledButton>
                        </ButtonGroup>
                    </GameCard>
                    <GameCard>
                        <GameTitle>Шашки</GameTitle>
                         <ButtonGroup>
                            <StyledButton onClick={() => handlePlayOnline('checkers')}>Онлайн</StyledButton>
                        </ButtonGroup>
                    </GameCard>
                    <GameCard>
                        <GameTitle>Нарды</GameTitle>
                        <ButtonGroup>
                            <StyledButton onClick={() => handlePlayOnline('backgammon')}>Онлайн</StyledButton>
                        </ButtonGroup>
                    </GameCard>

                    {/* --- 2. ДОБАВЛЯЕМ КАРТОЧКУ ДЛЯ ШАХМАТ --- */}
                    <GameCard>
                        <GameTitle>Шахматы</GameTitle>
                        <ButtonGroup>
                            <StyledButton onClick={() => handlePlayOnline('chess')}>Онлайн</StyledButton>
                        </ButtonGroup>
                    </GameCard>

                </GameSelection>
            </ProfileCard>
        </PageContainer>
    );
};

export default ProfilePage;