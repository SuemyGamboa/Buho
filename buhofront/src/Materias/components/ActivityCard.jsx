function ActivityCard({ activity, gameTypeLabels, locked, onStart, wasCompleted }) {
  return (
    <article className="player-activity-card">
      {(activity.cover_image_url || activity.content?.image_url) && (
        <img
          alt=""
          className="player-activity-card-cover"
          src={activity.cover_image_url || activity.content.image_url}
        />
      )}
      <div className="player-activity-copy">
        <span className="player-activity-type">
          {gameTypeLabels[activity.game_type] || 'Minijuego'} · Nivel {activity.difficulty}
        </span>
        <strong>{activity.name}</strong>
        <span>{activity.description || activity.instructions}</span>
        <div className="player-activity-rewards">
          <span><span className="material-symbols-outlined">stars</span> {activity.reward_stars}</span>
          <span><span className="material-symbols-outlined">paid</span> {activity.reward_coins}</span>
          {activity.badge_name && <span><span className="material-symbols-outlined">military_tech</span> {activity.badge_name}</span>}
        </div>
      </div>
      <button
        className="player-activity-start"
        disabled={locked}
        onClick={onStart}
        type="button"
      >
        {locked
          ? <><span className="material-symbols-outlined">lock</span> Bloqueado</>
          : wasCompleted ? 'Ver reto' : 'Empezar'}
      </button>
      {locked && (
        <span className="player-unlock-hint">
          Completa {activity.unlock_after} actividad{activity.unlock_after === 1 ? '' : 'es'} para desbloquear
        </span>
      )}
    </article>
  );
}

export default ActivityCard;
