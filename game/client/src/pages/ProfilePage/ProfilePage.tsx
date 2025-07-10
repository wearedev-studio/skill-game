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
                <ProfileAvatar 
                  src={user.avatar} 
                  alt={`Аватар ${user.username}`} 
                  // Добавляем заглушку на случай, если картинка не загрузится
                  onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/120'; }}
                />
                <ProfileDetails>
                    <UserName>{user.username}</UserName>
                    <UserEmail>{user.email}</UserEmail>
                    <UserBalance>Баланс: {user.balance} 💰</UserBalance>
                </ProfileDetails>
                <StyledButton onClick={() => navigate(`/find-game`)}>
                    Начать новую игру
                </StyledButton>
            </ProfileCard>
        </PageContainer>
    );
};

export default ProfilePage;