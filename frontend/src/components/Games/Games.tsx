import './Games.css';

const gameList = [
  { name: 'Шахматы', description: 'Классическая стратегическая игра для двух игроков.' },
  { name: 'Шашки', description: 'Проверьте свою тактику в этой популярной настольной игре.' },
  { name: 'Нарды', description: 'Древняя игра, сочетающая удачу и мастерство.' },
  { name: 'Крестики-нолики', description: 'Простая, но увлекательная игра для быстрого поединка.' }
];

export const Games = () => {
  return (
    <section id="games" className="games-section">
      <h2>Наши игры</h2>
      <div className="games-grid">
        {gameList.map(game => (
          <div key={game.name} className="game-card">
            <h3>{game.name}</h3>
            <p>{game.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};