import GameContent from './GameContent.jsx';

function MatchingGame({ gameSession, matchingPairs, onChooseMatchingLeft, onChooseMatchingRight }) {
  return (
    <div className="player-matching-game">
      <p>Toca un elemento de cada columna para unir la pareja.</p>
      <div className="player-matching-columns">
        <div>
          {matchingPairs.map((pair) => (
            <button
              className={`player-matching-card${gameSession.selectedLeft === pair.id ? ' is-selected' : ''}${gameSession.matched.includes(pair.id) ? ' is-matched' : ''}`}
              disabled={gameSession.matched.includes(pair.id)}
              key={`left-${pair.id}`}
              onClick={() => onChooseMatchingLeft(pair)}
              type="button"
            ><GameContent value={pair.left} /></button>
          ))}
        </div>
        <div>
          {[...matchingPairs].reverse().map((pair) => (
            <button
              className={`player-matching-card${gameSession.matched.includes(pair.id) ? ' is-matched' : ''}`}
              disabled={gameSession.matched.includes(pair.id)}
              key={`right-${pair.id}`}
              onClick={() => onChooseMatchingRight(pair)}
              type="button"
            ><GameContent value={pair.right} /></button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MatchingGame;
