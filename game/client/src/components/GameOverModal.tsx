


import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { StyledButton } from '../styles/StyledComponents';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--dark-surface);
  padding: 2rem 3rem;
  border-radius: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const InfoText = styled.p`
  color: var(--dark-text);
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const Title = styled.h2<{ status: 'win' | 'loss' | 'draw' }>`
  font-size: 2.5rem;
  color: ${props => {
    if (props.status === 'win') return '#4caf50';
    if (props.status === 'loss') return 'var(--error-color)';
    return 'var(--primary-color)';
  }};
`;

type RematchStatus = 'none' | 'offered' | 'received';

interface GameOverModalProps {
    winnerSymbol: string | null; // 'X', 'O', 'draw', или null
    playerSymbol: 'X' | 'O' | 'w' | 'b' | null;
    rematchStatus: RematchStatus;
    onOfferRematch: () => void;
    onAcceptRematch: () => void;
    onRejectRematch: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ winnerSymbol, playerSymbol, rematchStatus, onOfferRematch, onAcceptRematch, onRejectRematch }) => {
    const [timer, setTimer] = useState(5);

    useEffect(() => {
        if (rematchStatus === 'received') {
            setTimer(5);
            const interval = setInterval(() => {
                setTimer(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [rematchStatus]);

    // Определяем текст и статус для заголовка
     let titleText: string;
    let titleStatus: 'win' | 'loss' | 'draw';

    if (winnerSymbol === 'draw') {
        titleText = "Ничья!";
        titleStatus = 'draw';
    } else if (winnerSymbol === playerSymbol) {
        titleText = "Вы победили!";
        titleStatus = 'win';
    } else {
        titleText = "Вы проиграли!";
        titleStatus = 'loss';
    }

    const renderContent = () => {
        switch (rematchStatus) {
            case 'received':
                return (
                    <>
                        <InfoText>Оппонент предлагает реванш!</InfoText>
                        <p>Принять? ({timer}с)</p>
                        <ButtonGroup>
                            <StyledButton onClick={onAcceptRematch} style={{backgroundColor: '#4caf50'}}>Принять</StyledButton>
                            {/* Эта кнопка вызывает onRejectRematch */}
                            <StyledButton onClick={onRejectRematch} style={{backgroundColor: '#f44336'}}>Отказаться</StyledButton>
                        </ButtonGroup>
                    </>
                );
            case 'offered':
                return <InfoText>Предложение отправлено... Ожидание ответа.</InfoText>;
            case 'none':
            default:
                return (
                    <>
                        <InfoText>Сыграть еще раз?</InfoText>
                        <ButtonGroup>
                            <StyledButton onClick={onOfferRematch}>Предложить реванш</StyledButton>
                            {/* И эта кнопка тоже вызывает onRejectRematch */}
                            <StyledButton onClick={onRejectRematch} style={{backgroundColor: 'grey'}}>Не хочу</StyledButton>
                        </ButtonGroup>
                    </>
                );
        }
    };

    return (
        <ModalOverlay>
            <ModalContent>
                <Title status={titleStatus}>{titleText}</Title>
                {renderContent()}
            </ModalContent>
        </ModalOverlay>
    );
};

export default GameOverModal;


































// import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
// import { StyledButton } from '../styles/StyledComponents';

// const ModalOverlay = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background-color: rgba(0, 0, 0, 0.7);
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   z-index: 1000;
// `;

// const ModalContent = styled.div`
//   background-color: var(--dark-surface);
//   padding: 2rem 3rem;
//   border-radius: 8px;
//   text-align: center;
//   display: flex;
//   flex-direction: column;
//   gap: 1.5rem;
// `;

// const Title = styled.h2<{ won: any }>`
//   font-size: 2.5rem;
//   color: ${props => props.won ? '#4caf50' : 'var(--error-color)'};
// `;

// const ButtonGroup = styled.div`
//   display: flex;
//   gap: 1rem;
// `;

// interface GameOverModalProps {
//     isWinner: boolean | null; // null для ничьей
//     onOfferRematch: () => void;
//     onAcceptRematch: () => void;
//     onRejectRematch: () => void;
//     isRematchOffered: boolean;
// }

// const GameOverModal: React.FC<GameOverModalProps> = ({ isWinner, onOfferRematch, onAcceptRematch, onRejectRematch, isRematchOffered }) => {
//     const [timer, setTimer] = useState(5);

//     useEffect(() => {
//         if (isRematchOffered) {
//             const interval = setInterval(() => {
//                 setTimer(prev => (prev > 0 ? prev - 1 : 0));
//             }, 1000);
//             return () => clearInterval(interval);
//         }
//     }, [isRematchOffered]);

//     const titleText = isWinner === null ? "Ничья!" : isWinner ? "Вы победили!" : "Вы проиграли!";

//     return (
//         <ModalOverlay>
//             <ModalContent>
//                 <Title won={isWinner}>{titleText}</Title>
//                 {isRematchOffered ? (
//                     <div>
//                         <p>Оппонент предлагает реванш!</p>
//                         <p>Принять? ({timer}с)</p>
//                         <ButtonGroup>
//                             <StyledButton onClick={onAcceptRematch} style={{backgroundColor: '#4caf50'}}>Принять</StyledButton>
//                             <StyledButton onClick={onRejectRematch} style={{backgroundColor: '#f44336'}}>Отказаться</StyledButton>
//                         </ButtonGroup>
//                     </div>
//                 ) : (
//                     <div>
//                         <p>Сыграть еще раз?</p>
//                         <ButtonGroup>
//                             <StyledButton onClick={onOfferRematch}>Предложить реванш</StyledButton>
//                             <StyledButton onClick={onRejectRematch} style={{backgroundColor: 'grey'}}>Не хочу</StyledButton>
//                         </ButtonGroup>
//                     </div>
//                 )}
//             </ModalContent>
//         </ModalOverlay>
//     );
// };

// export default GameOverModal;