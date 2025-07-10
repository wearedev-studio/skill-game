import { useState, useEffect } from 'react';
import axios from 'axios';
import { Header } from '../../components/Header/Header';

const WalletPage = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(10);
  const [loading, setLoading] = useState(true);

  // Создаем перехватчик для всех запросов axios
  const api = axios.create({
    baseURL: 'http://localhost:3001/api',
  });

  api.interceptors.request.use(config => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const { data } = await api.get('/wallet/balance');
        setBalance(data.balance);
      } catch (error) {
        console.error('Не удалось загрузить баланс', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  const handleDeposit = async () => {
    try {
      const { data } = await api.post('/wallet/deposit', { amount });
      setBalance(data.balance);
    } catch (error) {
      console.error('Ошибка при пополнении', error);
      alert('Не удалось пополнить баланс');
    }
  };

  return (
    <>
      <Header />
      <div style={{ padding: '1rem' }}>
        <h2>Кошелек</h2>
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <h3>Текущий баланс: ${balance !== null ? balance.toFixed(2) : 'N/A'}</h3>
        )}
        <div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min="1"
          />
          <button onClick={handleDeposit}>Пополнить</button>
        </div>
      </div>
    </>
  );
};

export default WalletPage;