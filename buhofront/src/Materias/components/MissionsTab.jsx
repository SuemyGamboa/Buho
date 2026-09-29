function MissionsTab({
  allActivitiesCount,
  contentError,
  isLoadingContent,
  missionActivities,
  gameTypeLabels,
  onPlayAll,
  onStartActivity,
}) {
  return (
    <section className="player-tab-section" aria-labelledby="missions-title">
      <div className="player-tab-heading">
        <div>
          <span className="materia-badge materia-badge-primary">Misiones activas</span>
          <h2 id="missions-title">Retos para jugar</h2>
        </div>
        <button
          className="player-missions-play-all"
          disabled={isLoadingContent || missionActivities.length === 0}
          onClick={onPlayAll}
          type="button"
        >
          <span className="material-symbols-outlined" aria-hidden="true">shuffle</span>
          Jugar todos al azar
          <span className="player-missions-play-count">{missionActivities.length}</span>
        </button>
      </div>
      {contentError && <p className="materias-load-error" role="alert">{contentError}</p>}
      {isLoadingContent && <p className="materias-empty-state">Cargando misiones…</p>}
      {!isLoadingContent && missionActivities.length === 0 && (
        <p className="materias-empty-state">
          {allActivitiesCount
            ? '¡Completaste todos los retos disponibles! Revisa tu álbum de progreso.'
            : 'Todavía no hay actividades disponibles en las materias activas.'}
        </p>
      )}
      <div className="player-tab-list">
        {missionActivities.map((activity) => (
          <article className="player-tab-card" key={activity.id}>
            <span className="player-tab-card-icon material-symbols-outlined">sports_esports</span>
            <div className="player-tab-card-copy">
              <span>{activity.subjectName} · {gameTypeLabels[activity.game_type] || 'Minijuego'}</span>
              <strong>{activity.name}</strong>
              <small>{activity.description || activity.instructions}</small>
            </div>
            <button
              className="player-activity-start"
              onClick={() => onStartActivity(activity)}
              type="button"
            >Jugar</button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MissionsTab;
