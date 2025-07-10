import React, { useState } from 'react';
import API from '../../api';
import {
    PageContainer,
    FormWrapper,
    StyledInput,
    StyledButton,
    ErrorMessage,
    InfoMessage // Импортируем новый компонент
} from '../../styles/StyledComponents';
import { Link } from 'react-router-dom';

const ResetPasswordPage: React.FC = () => {
    const [step, setStep] = useState(1); // 1: email, 2: code, 3: success
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await API.post('/auth/request-reset', { email });
            setMessage('Код успешно отправлен на ваш email. Проверьте почту.');
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Не удалось отправить код');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await API.post('/auth/reset-password', { email, code, password });
            setMessage('Пароль успешно изменен!');
            setStep(3); // Финальный шаг
        } catch (err: any) {
            setError(err.response?.data?.message || 'Не удалось сбросить пароль');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <FormWrapper onSubmit={handleRequestCode}>
                        <h2 style={{ textAlign: 'center' }}>Сброс пароля</h2>
                        <InfoMessage>Введите ваш email, чтобы получить код для сброса пароля.</InfoMessage>
                        <StyledInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                        {error && <ErrorMessage>{error}</ErrorMessage>}
                        <StyledButton type="submit">Получить код</StyledButton>
                    </FormWrapper>
                );
            case 2:
                return (
                    <FormWrapper onSubmit={handleResetPassword}>
                        <h2 style={{ textAlign: 'center' }}>Подтверждение</h2>
                        {message && <InfoMessage>{message}</InfoMessage>}
                        <InfoMessage>Введите 4-значный код из письма и ваш новый пароль.</InfoMessage>
                        <StyledInput type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="4-значный код" required />
                        <StyledInput type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Новый пароль" required />
                        {error && <ErrorMessage>{error}</ErrorMessage>}
                        <StyledButton type="submit">Сбросить пароль</StyledButton>
                    </FormWrapper>
                );
            case 3:
                return (
                    <FormWrapper as="div"> {/* Используем as="div" чтобы убрать семантику формы */}
                        <h2 style={{ textAlign: 'center' }}>Успешно!</h2>
                        <InfoMessage>{message}</InfoMessage>
                        <StyledButton as={Link} to="/login" style={{ textDecoration: 'none', textAlign: 'center' }}>
                            Перейти ко входу
                        </StyledButton>
                    </FormWrapper>
                );
            default:
                return null;
        }
    };

    return (
        <PageContainer>
            {renderStep()}
        </PageContainer>
    );
};

export default ResetPasswordPage;