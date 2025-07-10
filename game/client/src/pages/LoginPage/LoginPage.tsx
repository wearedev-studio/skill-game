import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
    PageContainer,
    FormWrapper,
    StyledInput,
    StyledButton,
    StyledLink,
    ErrorMessage
} from '../../styles/StyledComponents';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await API.post('/auth/login', { email, password });
            login(data);
            navigate('/profile');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка входа');
        }
    };

    return (
        <PageContainer>
            <FormWrapper onSubmit={handleSubmit}>
                <h2 style={{ textAlign: 'center' }}>Вход</h2>
                <StyledInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                <StyledInput type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" required />
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <StyledButton type="submit">Войти</StyledButton>
                <StyledLink to="/reset-password">Забыли пароль?</StyledLink>
            </FormWrapper>
        </PageContainer>
    );
};

export default LoginPage;