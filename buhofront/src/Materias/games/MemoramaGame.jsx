import GameContent from './GameContent.jsx';

function MemoramaGame({ gameSession, onFlipMemoryCard }) {
  return (
    <div className="player-memory-board" aria-label="Tablero de memorama">
      {gameSession.cards.map((card) => {
        const visible = gameSession.flipped.includes(card.id)
          || gameSession.matched.includes(card.pairId);
        return (
          <button
            aria-label={visible ? `Carta: ${card.content}` : 'Voltear carta'}
            className={`player-memory-card${visible ? ' is-visible' : ''}${gameSession.matched.includes(card.pairId) ? ' is-matched' : ''}`}
            disabled={gameSession.matched.includes(card.pairId)}
            key={card.id}
            onClick={() => onFlipMemoryCard(card)}
            type="button"
          >
            {visible
              ? <GameContent value={card.content} />
              : <span className="material-symbols-outlined">help</span>}
          </button>
        );
      })}
    </div>
  );
}

export default MemoramaGame;
