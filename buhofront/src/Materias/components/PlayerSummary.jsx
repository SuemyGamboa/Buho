function PlayerSummary({ allActivitiesCount, materiasCount, missionCount, playerName, playerProgress }) {
  const completedCount = playerProgress.completedActivities.length;
  const completionPercent = allActivitiesCount
    ? (completedCount / allActivitiesCount) * 100
    : 0;

  return (
    <section className="mission-card">
      <div className="mission-header">
        <div className="mission-title-group">
          <div className="mission-icon-wrapper">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              face_6
            </span>
          </div>
          <span className="mission-title">Resumen de {playerName}</span>
        </div>
        <span className="mission-badge">
          {completedCount} / {allActivitiesCount}
          <span className="material-symbols-outlined">task_alt</span>
        </span>
      </div>
      <p className="mission-desc">
        Perfil de demostración · {materiasCount} materias disponibles
      </p>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${completionPercent}%` }}
        ></div>
        <div className="progress-label">
          {allActivitiesCount ? Math.round(completionPercent) : 0}%
        </div>
      </div>
      <div className="player-quick-summary">
        <div>
          <span className="material-symbols-outlined">task_alt</span>
          <strong>{completedCount}</strong>
          <small>completadas</small>
        </div>
        <div>
          <span className="material-symbols-outlined">sports_esports</span>
          <strong>{missionCount}</strong>
          <small>por jugar</small>
        </div>
        <div>
          <span className="material-symbols-outlined">military_tech</span>
          <strong>{playerProgress.badges.length}</strong>
          <small>insignias</small>
        </div>
      </div>
    </section>
  );
}

export default PlayerSummary;
