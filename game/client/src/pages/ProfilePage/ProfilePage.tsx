import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { PageContainer, StyledButton } from '../../styles/StyledComponents';

// Стили для карточки профиля
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

// Стили для аватара
const ProfileAvatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid var(--primary-color);
  object-fit: cover;
`;

// Контейнер для информации
const ProfileDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

const UserName = styled.h2`
  font-size: 1.8rem;
  color: var(--light-text);
`;

const UserEmail = styled.p`
  font-size: 1rem;
  color: var(--dark-text);
`;

const UserBalance = styled.p`
  font-size: 1.2rem;
  color: var(--primary-color);
  font-weight: bold;
  margin-top: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  margin-top: 1.5rem;
`;

const SecondaryButton = styled(StyledButton)`
  background-color: var(--dark-surface);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);

  &:hover {
    background-color: rgba(97, 218, 251, 0.1);
  }
`;

const GameSelection = styled.div`
  width: 100%;
  margin-top: 2rem;
  border-top: 1px solid #444;
  padding-top: 2rem;
`;

const GameCard = styled.div`
  background-color: var(--dark-bg);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--dark-surface);
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GameTitle = styled.h3`
  font-size: 1.2rem;
`;


const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Этот хук защищает страницу от неавторизованных пользователей.
    // Если данных о пользователе нет, он перенаправляет на страницу входа.
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleFindGame = (gameType: 'tic-tac-toe' | 'checkers') => {
        // Переходим на страницу поиска, передавая тип игры
        navigate('/find-game', { state: { gameType } });
    };

    // Пока данные пользователя загружаются или если он был перенаправлен,
    // можно показать заглушку.
    if (!user) {
        return (
            <PageContainer>
                <p>Загрузка профиля...</p>
            </PageContainer>
        );
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
                        <StyledButton onClick={() => handleFindGame('tic-tac-toe')}>
                            Играть Онлайн
                        </StyledButton>
                    </GameCard>
                    <GameCard>
                        <GameTitle>Шашки</GameTitle>
                        <StyledButton onClick={() => handleFindGame('checkers')}>
                            Играть Онлайн
                        </StyledButton>
                    </GameCard>
                </GameSelection>
            </ProfileCard>
        </PageContainer>
    );
};

export default ProfilePage;