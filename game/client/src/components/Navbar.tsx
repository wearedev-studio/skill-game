import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Nav = styled.nav`
  height: 60px;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--dark-surface);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
`;

const NavLink = styled(Link)`
  color: var(--light-text);
  font-weight: 500;
  &:hover {
    color: var(--primary-color);
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: var(--light-text);
  font-weight: 500;
  cursor: pointer;
  font-size: 1rem;
   &:hover {
    color: var(--primary-color);
  }
`;

const UserInfo = styled.div`
  color: var(--dark-text);
`;


const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Nav>
            <Logo to="/">Крестики-Нолики</Logo>
            <NavLinks>
                {user ? (
                    <>
                        <UserInfo>Баланс: ${user.balance}</UserInfo>
                        <NavLink to="/profile">Профиль</NavLink>
                        <NavLink to="/find-game">Начать игру</NavLink>
                        <LogoutButton onClick={handleLogout}>Выйти</LogoutButton>
                    </>
                ) : (
                    <>
                        <NavLink to="/login">Войти</NavLink>
                        <NavLink to="/register">Регистрация</NavLink>
                    </>
                )}
            </NavLinks>
        </Nav>
    );
};

export default Navbar;