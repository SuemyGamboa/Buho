function GreetingCard({ missionCount, onSpeak, playerName }) {
  return (
    <section className="greeting-card">
      <div className="greeting-text">
        <h1 className="greeting-name">
          ¡Hola {playerName}! <span className="material-symbols-outlined greeting-wave">waving_hand</span>
        </h1>
        <p className="greeting-info">
          <span className="pulse-dot"></span>
          Tienes <strong>{missionCount} retos</strong> disponibles
        </p>
      </div>
      <button
        aria-label="Escuchar saludo"
        className="voice-btn voice-btn-yellow"
        onClick={(event) => onSpeak(event.currentTarget)}
        type="button"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          volume_up
        </span>
      </button>
    </section>
  );
}

export default GreetingCard;
