import React from 'react';
import './Board.css'; // Мы создадим этот файл для стилей

interface BoardProps {
  board: (string | null)[];
  onSquareClick: (index: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, onSquareClick }) => {
  return (
    <div className="board">
      {board.map((value, index) => (
        <button key={index} className="square" onClick={() => onSquareClick(index)}>
          {value}
        </button>
      ))}
    </div>
  );
};

export default Board;