function MascotCard({ missionActivities, onStart, playerName }) {
  return (
    <section className="player-mascot-card" aria-label="Mascota de bienvenida">
      <div
        aria-label="Búho, tu compañero de aprendizaje"
        className="player-mascot-avatar"
        role="img"
      >
        <span className="material-symbols-outlined player-mascot-sparkle" aria-hidden="true">
          auto_awesome
        </span>
      </div>
      <div className="player-mascot-chat">
        <span className="player-mascot-eyebrow">¡Tu compañero de aventuras!</span>
        <p>
          {missionActivities.length
            ? `¡Hola ${playerName}! Tienes ${missionActivities.length} ${missionActivities.length === 1 ? 'reto pendiente' : 'retos pendientes'} para jugar.`
            : `¡Muy bien, ${playerName}! Ya completaste todos los retos disponibles.`}
        </p>
        {missionActivities.length > 0 && (
          <ul className="player-mascot-pending-list">
            {missionActivities.slice(0, 2).map((activity) => (
              <li key={activity.id}>{activity.name}</li>
            ))}
            {missionActivities.length > 2 && (
              <li>y {missionActivities.length - 2} más</li>
            )}
          </ul>
        )}
        <button className="player-mascot-start" onClick={onStart} type="button">
          {missionActivities.length ? '¡Empezar a jugar!' : 'Ver misiones'}
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_forward
          </span>
        </button>
      </div>
    </section>
  );
}

export default MascotCard;
