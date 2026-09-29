function ResultScreen({
  activityResult,
  onClose,
  onRetry,
  onSkip,
  onStartNextRandomMission,
  playerName,
  randomMissionQueue,
  selectedActivity,
}) {
  return (
    <div className={`player-result-content${activityResult.success ? ' is-success' : ' is-retry'}`}>
      <div className="player-result-mascot" aria-hidden="true">
        <span className="material-symbols-outlined">
          {activityResult.success ? 'celebration' : 'sentiment_satisfied'}
        </span>
      </div>
      <span className="player-result-eyebrow">
        {activityResult.success ? '¡RETO COMPLETADO!' : '¡SIGUE PRACTICANDO!'}
      </span>
      <h2 id="player-activity-title">
        {activityResult.success ? `¡Muy bien, ${playerName}!` : '¡Buen intento!'}
      </h2>
      <p>
        {activityResult.success
          ? 'Resolviste el reto. Mira el resumen de tu aventura:'
          : 'Cada intento te ayuda a aprender. Revisa cómo te fue y vuelve a probar.'}
      </p>
      <div className="player-result-score">
        <strong>{activityResult.correct} <span>/ {activityResult.total}</span></strong>
        <span>respuestas correctas</span>
        <div className="player-result-progress">
          <span style={{ width: `${activityResult.total ? (activityResult.correct / activityResult.total) * 100 : 0}%` }} />
        </div>
        <small>{activityResult.attempts} intentos</small>
      </div>
      <div className="player-result-rewards">
        <div>
          <span className="material-symbols-outlined">stars</span>
          <strong>+{activityResult.stars}</strong>
          <small>estrellas</small>
        </div>
        <div>
          <span className="material-symbols-outlined">paid</span>
          <strong>+{activityResult.coins}</strong>
          <small>monedas</small>
        </div>
        {activityResult.success && selectedActivity.badge_name && (
          <div>
            <span className="material-symbols-outlined">military_tech</span>
            <strong>¡Nueva!</strong>
            <small>{selectedActivity.badge_name}</small>
          </div>
        )}
      </div>
      {activityResult.success ? (
        <button
          className="player-game-primary-button"
          onClick={randomMissionQueue
            ? onStartNextRandomMission
            : onClose}
          type="button"
        >
          {randomMissionQueue
            ? randomMissionQueue.length
              ? `Siguiente reto aleatorio (${randomMissionQueue.length} restantes)`
              : 'Terminar ronda aleatoria'
            : 'Volver a las actividades'}
          <span className="material-symbols-outlined">
            {randomMissionQueue?.length ? 'shuffle' : 'arrow_forward'}
          </span>
        </button>
      ) : (
        <div className="player-result-actions">
          <button
            className="player-game-primary-button"
            onClick={onRetry}
            type="button"
          >Intentar de nuevo <span className="material-symbols-outlined">replay</span></button>
          {randomMissionQueue?.length > 0 && (
            <button
              className="player-game-secondary-button"
              onClick={onSkip}
              type="button"
            >
              Saltar este reto
              <span className="material-symbols-outlined">skip_next</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ResultScreen;
