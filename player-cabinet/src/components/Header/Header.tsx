import { Link, useNavigate } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#eee' }}>
      <nav>
        <Link to="/lobby" style={{ marginRight: '1rem' }}>Лобби</Link>
        <Link to="/wallet">Кошелек</Link>
      </nav>
      <button onClick={handleLogout}>Выйти</button>
    </header>
  );
};