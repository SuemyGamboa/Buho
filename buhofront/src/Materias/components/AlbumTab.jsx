function AlbumTab({ gameTypeLabels, playerProgress }) {
  return (
    <section className="player-tab-section" aria-labelledby="album-title">
      <div className="player-tab-heading">
        <div>
          <span className="materia-badge materia-badge-primary">Tu progreso</span>
          <h2 id="album-title">Mi Álbum</h2>
        </div>
        <span className="player-tab-count">{playerProgress.completedActivities.length} completadas</span>
      </div>
      <div className="player-album-summary">
        <span><span className="material-symbols-outlined">stars</span> {playerProgress.stars} estrellas</span>
        <span><span className="material-symbols-outlined">paid</span> {playerProgress.coins} monedas</span>
        <span><span className="material-symbols-outlined">military_tech</span> {playerProgress.badges.length} insignias</span>
      </div>
      {playerProgress.completedActivities.length === 0 ? (
        <p className="materias-empty-state">Completa una actividad y aquí aparecerán tus insignias y logros.</p>
      ) : (
        <div className="player-tab-list">
          {playerProgress.completedActivities.map((activity) => (
            <article className="player-tab-card" key={activity.id}>
              <span className="player-tab-card-icon material-symbols-outlined">
                {activity.badge_name ? 'workspace_premium' : 'task_alt'}
              </span>
              <div className="player-tab-card-copy">
                <span>{activity.subjectName} · {gameTypeLabels[activity.game_type] || 'Minijuego'}</span>
                <strong>{activity.badge_name || activity.name}</strong>
                <small>{activity.badge_name ? activity.name : 'Reto completado'}</small>
              </div>
              <span className="player-album-reward">
                <span className="material-symbols-outlined">stars</span> {activity.reward_stars}
              </span>
            </article>
          ))}
        </div>
      )}
      {playerProgress.visualRewards.length > 0 && (
        <div className="player-reward-shelf">
          <div className="player-reward-shelf-heading">
            <strong>Recompensas desbloqueadas</strong>
          </div>
          <div className="player-reward-shelf-items">
            {playerProgress.visualRewards.map((reward, index) => (
              <span className="player-collection-item" key={`${reward.name}-${index}`}>
                {reward.image_url && <img alt="" src={reward.image_url} />}
                <span className="material-symbols-outlined">redeem</span> {reward.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default AlbumTab;
