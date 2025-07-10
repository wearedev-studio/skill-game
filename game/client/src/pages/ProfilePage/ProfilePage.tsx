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
                
                <ButtonGroup>
                    <StyledButton onClick={() => navigate('/find-game')}>
                        Играть Онлайн
                    </StyledButton>
                    <SecondaryButton onClick={() => navigate('/game/offline')}>
                        Играть с Ботом
                    </SecondaryButton>
                </ButtonGroup>
            </ProfileCard>
        </PageContainer>
    );
};

export default ProfilePage;