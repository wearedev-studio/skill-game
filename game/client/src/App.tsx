import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import LoginPage from './pages/LoginPage/LoginPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import FindGamePage from './pages/FindGamePage/FindGamePage';
import GamePage from './pages/GamePage/GamePage';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage';
import OfflineGamePage from './pages/OfflineGamePage/OfflineGamePage';
import Navbar from './components/Navbar'; // Импортируем Navbar
import { PageContainer } from './styles/StyledComponents';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar /> {/* Добавляем Navbar сюда */}
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/find-game" element={<FindGamePage />} />
          <Route path="/game/offline" element={<OfflineGamePage />} />
          <Route path="/game/:gameId" element={<GamePage />} />
          <Route path="/" element={
            <PageContainer>
              <h1>Добро пожаловать в Крестики-Нолики Онлайн!</h1>
              <p>Начните новую игру через меню навигации.</p>
            </PageContainer>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;