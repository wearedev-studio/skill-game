import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import LobbyPage from './pages/LobbyPage/LobbyPage';
import GamePage from './pages/GamePage/GamePage';
import WalletPage from './pages/WalletPage/WalletPage';
// Пока создадим пустой компонент для игры

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/wallet" element={<WalletPage />} />
        {/* По умолчанию перенаправляем на логин */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;