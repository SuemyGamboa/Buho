import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomeScreen.css';

const playerNameStorageKey = 'mateo-demo-name';

const WelcomeScreen = () => {
  const [isMascotBouncing, setIsMascotBouncing] = useState(false);
  const [playerName, setPlayerName] = useState(() => {
    try {
      return localStorage.getItem(playerNameStorageKey) || 'Mateo';
    } catch {
      return 'Mateo';
    }
  });
  const [nameDraft, setNameDraft] = useState(playerName);
  const [isEditingName, setIsEditingName] = useState(false);
  const navigate = useNavigate();

  const handleMascotClick = () => {
    setIsMascotBouncing(true);
    setTimeout(() => setIsMascotBouncing(false), 1000);
  };

  const handleAudioClick = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `¡Hola ${playerName}! ¡Bienvenido de nuevo a tu aventura de aprendizaje! ¿Listo para jugar?`
      );
      utterance.lang = 'es-ES';
      utterance.pitch = 1.3;
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartClick = (e) => {
    const btn = e.currentTarget;
    btn.style.boxShadow = '0 1px 0 #d1a800, 0 4px 8px rgba(254, 211, 58, 0.3)';
    setTimeout(() => {
      btn.style.boxShadow = '0 6px 0 #d1a800, 0 10px 20px rgba(254, 211, 58, 0.4)';
      // 👇 Redirige a la pantalla de materias
      navigate('/materias');
    }, 200);
  };

  const savePlayerName = (event) => {
    event.preventDefault();
    const nextName = nameDraft.trim();
    if (!nextName) return;
    setPlayerName(nextName);
    try {
      localStorage.setItem(playerNameStorageKey, nextName);
    } catch {
      // Keep the updated name for this visit if storage is unavailable.
    }
    setIsEditingName(false);
  };

  return (
    <main className="welcome-main">
      <div className="welcome-container">
        {/* Ornamentos de fondo */}
        <div className="ornament ornament-1"></div>
        <div className="ornament ornament-2"></div>
        <div className="ornament ornament-3"></div>

        {/* Barra de audio */}
        <div className="audio-prompt-bar">
          <button
            className="audio-speaker-btn"
            id="audio-speaker-btn"
            onClick={handleAudioClick}
          >
            <span
              className="material-symbols-outlined audio-icon animate-pulse"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              volume_up
            </span>
            <span className="audio-label">¡Escuchar saludo!</span>
          </button>
          <div className="audio-wave">
            <span className="wave-bar wave-bar-1"></span>
            <span className="wave-bar wave-bar-2"></span>
            <span className="wave-bar wave-bar-3"></span>
            <span className="wave-bar wave-bar-4"></span>
          </div>
        </div>

        {/* Tarjeta central */}
        <div className="welcome-card">
          {/* Badges */}
          <div className="badge badge-level">
            <span
              className="material-symbols-outlined badge-icon"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span>AVENTURERO</span>
          </div>
          <div className="badge badge-points">
            <span
              className="material-symbols-outlined badge-icon"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              military_tech
            </span>
            <span>LISTO PARA JUGAR</span>
          </div>

          {/* Mascota */}
          <div className="mascot-wrapper">
            <div className="mascot-container">
              <div className="mascot-glow"></div>
              <img
                alt="Mascota Estrella sonriente y amigable"
                className={`mascot-avatar ${isMascotBouncing ? 'animate-bounce' : ''}`}
                id="mascot-avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwzJVNzeHvFNvvM0CiEx1lhJV-snEp55z2tG0DQ5TD3nyuArINXr1ciDa-iilEURIZnxWu1RGPD_reaULq8rNR-8D3vS46yz7BauNFjnUa6CwZr4mqb6OgubM9N2Qm3bfe3wONnu_e6P5mYcdeDv77SMf-v_EgqMbW7rPi79SzJqz83sU3UPVZBS0XDXfXdx44GYPO81Lk3WubHx_O0TCVaP9i-fbRBspny-tNtF1EyUjwLXmtIwh1"
                onClick={handleMascotClick}
              />
            </div>
          </div>

          {/* Saludo */}
          <div className="greeting">
            <h1 className="greeting-title">¡Hola, {playerName}!</h1>
            <p className="greeting-subtitle">
              Aprende jugando y descubre mundos mágicos hoy.
            </p>
          </div>

          {/* Perfil del niño */}
          <div className="profile-island">
            <div className="profile-info">
              <div className="profile-avatar-wrapper">
                <span
                  className="material-symbols-outlined profile-avatar-icon"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  face_6
                </span>
                <span className="profile-status-dot"></span>
              </div>
              <div className="profile-text">
                <p className="profile-name">{playerName}</p>
                <p className="profile-detail">PERFIL DE DEMOSTRACIÓN</p>
              </div>
            </div>
            <button
              className="profile-edit-btn"
              aria-label="Editar nombre del perfil"
              onClick={() => {
                setNameDraft(playerName);
                setIsEditingName(true);
              }}
              type="button"
            >
              <span className="material-symbols-outlined profile-edit-icon">edit</span>
            </button>
          </div>

          {/* Botón principal */}
          <div className="start-btn-wrapper">
            <button
              className="start-btn"
              id="btn-start-quest"
              onClick={handleStartClick}
            >
              <span>¡EMPEZAR A JUGAR!</span>
              <span className="material-symbols-outlined start-btn-emoji">rocket_launch</span>
            </button>
          </div>


        </div>

        {/* Zona de papás */}
        <div className="parent-gate-wrapper">
          <button
            className="parent-gate-btn"
            id="btn-parent-gate"
            onClick={() => navigate('/admin')}
            type="button"
          >
            <span className="material-symbols-outlined parent-gate-icon">lock</span>
            <span>Zona de Papás</span>
          </button>
        </div>
      </div>
      {isEditingName && (
        <div
          className="profile-name-backdrop"
          onClick={() => setIsEditingName(false)}
          role="presentation"
        >
          <form
            aria-labelledby="profile-name-title"
            aria-modal="true"
            className="profile-name-dialog"
            onClick={(event) => event.stopPropagation()}
            onSubmit={savePlayerName}
            role="dialog"
          >
            <button
              aria-label="Cerrar"
              className="profile-name-close"
              onClick={() => setIsEditingName(false)}
              type="button"
            >
              ×
            </button>
            <span className="material-symbols-outlined" aria-hidden="true">face_6</span>
            <h2 id="profile-name-title">¿Cómo te llamas?</h2>
            <label htmlFor="profile-name-input">Nombre del jugador</label>
            <input
              autoFocus
              id="profile-name-input"
              maxLength="40"
              onChange={(event) => setNameDraft(event.target.value)}
              required
              value={nameDraft}
            />
            <button className="profile-name-save" type="submit">Guardar nombre</button>
          </form>
        </div>
      )}
    </main>
  );
};

export default WelcomeScreen;