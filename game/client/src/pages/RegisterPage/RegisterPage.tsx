import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api';
import {
    PageContainer,
    FormWrapper,
    StyledInput,
    StyledButton,
    StyledLink,
    ErrorMessage
} from '../../styles/StyledComponents';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Пароль должен быть не менее 6 символов');
            return;
        }
        try {
            await API.post('/auth/register', { username, email, password });
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка регистрации');
        }
    };

    return (
        <PageContainer>
            <FormWrapper onSubmit={handleSubmit}>
                <h2 style={{ textAlign: 'center' }}>Регистрация</h2>
                <StyledInput type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Имя пользователя" required />
                <StyledInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                <StyledInput type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" required />
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <StyledButton type="submit">Создать аккаунт</StyledButton>
                <StyledLink to="/login">Уже есть аккаунт? Войти</StyledLink>
            </FormWrapper>
        </PageContainer>
    );
};

export default RegisterPage;