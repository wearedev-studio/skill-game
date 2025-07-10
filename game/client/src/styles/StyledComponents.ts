import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: calc(100vh - 60px); // 60px - высота навбара
`;

export const FormWrapper = styled.form`
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: var(--dark-surface);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const StyledInput = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 4px;
  border: 1px solid #555;
  background-color: #333;
  color: var(--light-text);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

export const StyledButton = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  background-color: var(--primary-color);
  color: #000;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #40c5e6;
  }
`;

export const ErrorMessage = styled.p`
  color: var(--error-color);
  text-align: center;
  margin-top: -1rem;
  margin-bottom: 0.5rem;
`;

// ДОБАВЬТЕ ЭТОТ КОМПОНЕНТ
export const InfoMessage = styled.p`
  color: var(--dark-text);
  text-align: center;
  line-height: 1.4;
`;

export const StyledLink = styled(Link)`
  text-align: center;
  &:hover {
    text-decoration: underline;
  }
`;