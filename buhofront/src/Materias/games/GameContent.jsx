const contentIsImage = (value) => (
  typeof value === 'string' && (/^https?:\/\//i.test(value) || value.startsWith('/storage/'))
);

function GameContent({ value, className = '' }) {
  if (contentIsImage(value)) {
    return <img alt="Contenido de actividad" className={`player-game-image ${className}`} src={value} />;
  }

  return <span className={className}>{value}</span>;
}

export default GameContent;
