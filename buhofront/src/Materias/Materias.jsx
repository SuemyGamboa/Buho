import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Materias.css';

const defaultSubjectImage = '/buhoPredeterminado.jpg';

const gameTypeLabels = {
  puzzle: 'Rompecabezas',
  memorama: 'Memorama',
  drag_drop: 'Arrastrar y colocar',
  find_items: 'Encontrar elementos',
  timed_challenge: 'Reto contra el tiempo',
  build: 'Construir y completar',
  aim_select: 'Apuntar y seleccionar',
  quiz: 'Preguntas',
  create_organize: 'Crear y organizar',
  matching: 'Unir parejas',
  addition: 'Sumas',
};

const makeGameSession = () => ({
  cards: [],
  flipped: [],
  matched: [],
  moves: 0,
  selectedLeft: null,
  selectedItem: null,
  placements: {},
  quizIndex: 0,
  selectedOption: null,
  correctAnswers: 0,
  attempts: 0,
  feedback: '',
});

const getResultSummary = (gameType, session, totals) => {
  if (gameType === 'quiz') {
    return {
      correct: session.correctAnswers,
      total: totals.questions,
      attempts: session.attempts,
    };
  }
  if (gameType === 'memorama') {
    return {
      correct: session.matched.length,
      total: totals.pairs,
      attempts: session.moves,
    };
  }
  if (gameType === 'matching') {
    return {
      correct: session.matched.length,
      total: totals.pairs,
      attempts: session.attempts,
    };
  }
  return {
    correct: Object.keys(session.placements).length,
    total: totals.items,
    attempts: session.attempts,
  };
};

const contentIsImage = (value) => (
  typeof value === 'string' && (/^https?:\/\//i.test(value) || value.startsWith('/storage/'))
);

function GameContent({ value, className = '' }) {
  if (contentIsImage(value)) {
    return <img alt="Contenido de actividad" className={`player-game-image ${className}`} src={value} />;
  }

  return <span className={className}>{value}</span>;
}

const Materias = () => {
  const [activeTab, setActiveTab] = useState('materias');
  const [contentError, setContentError] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [gameSession, setGameSession] = useState(makeGameSession);
  const [activityResult, setActivityResult] = useState(null);
  const memoryTimerRef = useRef(null);
  const gameTimerRef = useRef(null);
  const gameSessionRef = useRef(gameSession);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [playerName] = useState(() => {
    try {
      return localStorage.getItem('mateo-demo-name') || 'Mateo';
    } catch {
      return 'Mateo';
    }
  });
  const [completedActivityIds, setCompletedActivityIds] = useState(() => {
    try {
      const storedIds = JSON.parse(localStorage.getItem('mateo-demo-completed') || '[]');
      return Array.isArray(storedIds) ? storedIds : [];
    } catch {
      return [];
    }
  });
  const navigate = useNavigate();

  const speakTitle = (text, btn) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
      if (btn) {
        btn.classList.add('scale-110');
        setTimeout(() => btn.classList.remove('scale-110'), 600);
      }
    }
  };
  const closeActivity = () => {
    window.clearTimeout(memoryTimerRef.current);
    window.clearInterval(gameTimerRef.current);
    setSelectedActivity(null);
    setActivityResult(null);
  };
  useEffect(() => () => window.clearTimeout(memoryTimerRef.current), []);

  const playVoiceGreeting = (btn) => {
    speakTitle(
      `¡Hola ${playerName}! Tienes retos disponibles. ¿Listo para jugar?`,
      btn
    );
  };

  const [materias, setMaterias] = useState([]);

  useEffect(() => {
    localStorage.setItem('mateo-demo-completed', JSON.stringify(completedActivityIds));
  }, [completedActivityIds]);

  const playerProgress = useMemo(() => {
    const completedActivities = materias.flatMap((subject) => (
      (subject.activities || []).map((activity) => ({
        ...activity,
        subjectName: subject.name,
      }))
    ))
      .filter((activity) => completedActivityIds.includes(activity.id));

    return {
      stars: completedActivities.reduce((total, activity) => total + activity.reward_stars, 0),
      coins: completedActivities.reduce((total, activity) => total + activity.reward_coins, 0),
      badges: completedActivities.filter((activity) => activity.badge_name),
      visualRewards: completedActivities
        .map((activity) => activity.content?.reward_visual)
        .filter((reward) => reward?.name),
      completedActivities,
    };
  }, [completedActivityIds, materias]);
  const allActivities = useMemo(
    () => materias.flatMap((subject) => (subject.activities || []).map((activity) => ({
      ...activity,
      subjectId: subject.id,
      subjectName: subject.name,
    }))),
    [materias],
  );
  const availableActivities = allActivities.filter(
    (activity) => {
      if (completedActivityIds.includes(activity.id)) return false;
      const completedInSubject = allActivities.filter((item) => (
        item.subjectId === activity.subjectId && completedActivityIds.includes(item.id)
      )).length;
      return activity.unlock_after <= completedInSubject;
    },
  );
  const getActivityDialogData = (activity) => ({
    ...activity,
    gameTypeLabel: gameTypeLabels[activity.game_type] || 'Minijuego',
  });
  const startActivity = (activity) => {
    const activityData = getActivityDialogData(activity);
    const content = activityData.content && Object.keys(activityData.content).length
      ? activityData.content
      : activityData.config || {};
    const cards = (content.pairs || []).flatMap((pair) => [
      { id: `${pair.id}:a`, pairId: pair.id, content: pair.content_a },
      { id: `${pair.id}:b`, pairId: pair.id, content: pair.content_b },
    ]).sort(() => Math.random() - 0.5);
    setSelectedActivity(activityData);
    setGameSession({ ...makeGameSession(), cards });
    const timeLimit = Number(activityData.time_limit_seconds || content.time_limit || 0);
    setRemainingSeconds(timeLimit > 0 ? timeLimit : null);
    setActivityResult(null);
  };
  const finishActivity = useCallback((success, summary) => {
    window.clearTimeout(memoryTimerRef.current);
    window.clearInterval(gameTimerRef.current);
    setActivityResult({
      success,
      ...summary,
      stars: success ? Number(selectedActivity.reward_stars || 0) : 0,
      coins: success ? Number(selectedActivity.reward_coins || 0) : 0,
    });
    if (success) {
      setCompletedActivityIds((current) => (
        current.includes(selectedActivity.id) ? current : [...current, selectedActivity.id]
      ));
    }
  }, [selectedActivity]);
  const activityContent = selectedActivity?.content
    && Object.keys(selectedActivity.content).length
    ? selectedActivity.content
    : selectedActivity?.config || {};
  const memoramaPairs = activityContent.pairs || [];
  const matchingPairs = activityContent.pairs || [];
  const quizQuestions = activityContent.questions || [];
  const dragZones = activityContent.zones || [];
  const dragItems = activityContent.items || [];
  const activityTimeLimit = Number(
    selectedActivity?.time_limit_seconds || activityContent.time_limit || 0,
  );
  useEffect(() => {
    gameSessionRef.current = gameSession;
  }, [gameSession]);

  useEffect(() => {
    if (!selectedActivity || activityResult || activityTimeLimit <= 0) {
      return undefined;
    }

    const deadline = Date.now() + activityTimeLimit * 1000;
    gameTimerRef.current = window.setInterval(() => {
      const secondsLeft = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemainingSeconds((current) => (
        current === secondsLeft ? current : secondsLeft
      ));
      if (secondsLeft === 0) {
        window.clearInterval(gameTimerRef.current);
        finishActivity(false, getResultSummary(
          selectedActivity.game_type,
          gameSessionRef.current,
          {
            items: dragItems.length,
            pairs: memoramaPairs.length,
            questions: quizQuestions.length,
          },
        ));
      }
    }, 250);

    return () => window.clearInterval(gameTimerRef.current);
  }, [
    activityResult,
    activityTimeLimit,
    dragItems.length,
    finishActivity,
    memoramaPairs.length,
    quizQuestions.length,
    selectedActivity,
  ]);
  const flipMemoryCard = (card) => {
    if (gameSession.matched.includes(card.pairId)
      || gameSession.flipped.includes(card.id)
      || gameSession.flipped.length >= 2) return;

    const flipped = [...gameSession.flipped, card.id];
    if (flipped.length === 1) {
      setGameSession({ ...gameSession, flipped });
      return;
    }

    const firstCard = gameSession.cards.find((entry) => entry.id === flipped[0]);
    const isMatch = firstCard?.pairId === card.pairId;
    const matched = isMatch ? [...gameSession.matched, card.pairId] : gameSession.matched;
    const moves = gameSession.moves + 1;
    setGameSession({ ...gameSession, flipped, matched, moves });

    window.clearTimeout(memoryTimerRef.current);
    memoryTimerRef.current = window.setTimeout(() => {
      setGameSession((current) => ({ ...current, flipped: [] }));
      if (isMatch && matched.length === memoramaPairs.length) {
        finishActivity(true, { correct: matched.length, total: memoramaPairs.length, attempts: moves });
      }
    }, isMatch ? 450 : 900);
  };
  const chooseMatchingLeft = (pair) => {
    if (!gameSession.matched.includes(pair.id)) {
      setGameSession({ ...gameSession, selectedLeft: pair.id, feedback: '' });
    }
  };
  const chooseMatchingRight = (pair) => {
    if (!gameSession.selectedLeft || gameSession.matched.includes(pair.id)) return;
    const isMatch = gameSession.selectedLeft === pair.id;
    const matched = isMatch ? [...gameSession.matched, pair.id] : gameSession.matched;
    const attempts = gameSession.attempts + 1;
    setGameSession({
      ...gameSession,
      selectedLeft: null,
      matched,
      attempts,
      feedback: isMatch ? '¡Pareja correcta!' : 'Esa pareja no coincide. Intenta otra vez.',
    });
    if (isMatch && matched.length === matchingPairs.length) {
      finishActivity(true, { correct: matched.length, total: matchingPairs.length, attempts });
    }
  };
  const answerQuizQuestion = () => {
    if (gameSession.selectedOption === null) return;
    const question = quizQuestions[gameSession.quizIndex];
    const isCorrect = question.options[gameSession.selectedOption]?.is_correct === true;
    const correctAnswers = gameSession.correctAnswers + (isCorrect ? 1 : 0);
    const attempts = gameSession.attempts + 1;
    if (gameSession.quizIndex + 1 === quizQuestions.length) {
      finishActivity(correctAnswers === quizQuestions.length, {
        correct: correctAnswers,
        total: quizQuestions.length,
        attempts,
      });
      return;
    }
    setGameSession({
      ...gameSession,
      quizIndex: gameSession.quizIndex + 1,
      selectedOption: null,
      correctAnswers,
      attempts,
      feedback: isCorrect ? '¡Correcto! Vamos con la siguiente.' : 'No pasa nada, sigamos practicando.',
    });
  };
  const placeDragItem = (zone, itemId = gameSession.selectedItem) => {
    const item = dragItems.find((entry) => entry.id === itemId);
    if (!item || gameSession.placements[item.id]) return;
    const isCorrect = item.correct_zone === zone.id;
    const attempts = gameSession.attempts + 1;
    if (!isCorrect) {
      setGameSession({
        ...gameSession,
        selectedItem: null,
        attempts,
        feedback: 'Ese objeto va en otra zona. Prueba de nuevo.',
      });
      return;
    }
    const placements = { ...gameSession.placements, [item.id]: zone.id };
    const matched = Object.keys(placements).length;
    setGameSession({
      ...gameSession,
      placements,
      selectedItem: null,
      matched: [...gameSession.matched, item.id],
      attempts,
      feedback: '¡Muy bien! Ese elemento va aquí.',
    });
    if (matched === dragItems.length) {
      finishActivity(true, { correct: matched, total: dragItems.length, attempts });
    }
  };

  useEffect(() => {
    let cancelled = false;

    fetch('/api/subjects', { headers: { Accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) {
          throw new Error('No fue posible cargar las materias disponibles.');
        }
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        setMaterias(data.map((subject) => {
          const color = subject.color || '#4d96ff';
          const image = subject.activities
            ?.map((activity) => activity.cover_image_url || activity.content?.image_url)
            .find((url) => typeof url === 'string' && url.length > 0);

          return {
            ...subject,
            id: subject.id,
            badge: 'Materia activa',
            badgeColor: 'primary',
            titulo: subject.name,
            descripcion: subject.description || '',
            icono: subject.icon || 'auto_stories',
            imagen: subject.image_url || image || defaultSubjectImage,
            activities: subject.activities || [],
            colorFondo: color,
            colorTexto: '#ffffff',
            progresoColor: color,
            gradient: `linear-gradient(135deg, ${color}, ${color}b3)`,
            shadowColor: color,
            shadowBoton: color,
            img: image || defaultSubjectImage,
            actividadesDisponibles: subject.activities?.length || 0,
            insignia: 'Progreso de materia',
            insigniaIcono: 'military_tech',
            insigniaColor: color,
          };
        }));
      })
      .catch(() => {
        if (!cancelled) {
          setContentError('No pudimos cargar las materias. Comprueba la conexión e inténtalo de nuevo.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingContent(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: 'home' },
    { id: 'materias', label: 'Materias', icon: 'category' },
    { id: 'misiones', label: 'Misiones', icon: 'flag_circle' },
    { id: 'mi-album', label: 'Mi Álbum', icon: 'stars' },
  ];

  return (
    <>
      {/* HEADER */}
      <header className="home-header">
        <div className="home-header-content">
          <div className="home-logo">
            <img
              alt="ChikiAprende Star Mascot Logo"
              className="home-logo-img"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwzJVNzeHvFNvvM0CiEx1lhJV-snEp55z2tG0DQ5TD3nyuArINXr1ciDa-iilEURIZnxWu1RGPD_reaULq8rNR-8D3vS46yz7BauNFjnUa6CwZr4mqb6OgubM9N2Qm3bfe3wONnu_e6P5mYcdeDv77SMf-v_EgqMbW7rPi79SzJqz83sU3UPVZBS0XDXfXdx44GYPO81Lk3WubHx_O0TCVaP9i-fbRBspny-tNtF1EyUjwLXmtIwh1"
            />
            <div className="home-logo-text">
              <span className="home-logo-title">ChikiAprende</span>
              <span className="home-logo-badge">
                ¡A jugar! <span className="material-symbols-outlined">stars</span>
              </span>
            </div>
          </div>
          <div className="home-stats">
            <div className="stat-pill stat-yellow">
              <span className="material-symbols-outlined">stars</span>
              <span className="stat-value">{playerProgress.stars}</span>
            </div>
            <div className="stat-pill stat-blue">
              <span className="material-symbols-outlined">paid</span>
              <span className="stat-value">{playerProgress.coins}</span>
            </div>
            <button
              aria-label={`Volver al perfil de ${playerName}`}
              className="home-profile home-profile-button"
              onClick={() => navigate('/')}
              title="Volver al inicio del perfil"
              type="button"
            >
              <span className="material-symbols-outlined" aria-hidden="true">face_6</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="home-main">
        <div className="home-content">
          {/* Saludo */}
          <section className="greeting-card">
            <div className="greeting-text">
              <h1 className="greeting-name">
                ¡Hola {playerName}! <span className="material-symbols-outlined greeting-wave">waving_hand</span>
              </h1>
              <p className="greeting-info">
                <span className="pulse-dot"></span>
                Tienes <strong>{availableActivities.length} retos</strong> disponibles
              </p>
            </div>
            <button
              aria-label="Escuchar saludo"
              className="voice-btn voice-btn-yellow"
              onClick={(e) => playVoiceGreeting(e.currentTarget)}
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

          {/* Resumen del perfil del jugador */}
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
                {playerProgress.completedActivities.length} / {allActivities.length}
                <span className="material-symbols-outlined">task_alt</span>
              </span>
            </div>
            <p className="mission-desc">
              Perfil de demostración · {materias.length} materias disponibles
            </p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${allActivities.length
                    ? (playerProgress.completedActivities.length / allActivities.length) * 100
                    : 0}%`,
                }}
              ></div>
              <div className="progress-label">
                {allActivities.length
                  ? Math.round((playerProgress.completedActivities.length / allActivities.length) * 100)
                  : 0}%
              </div>
            </div>
            <div className="player-quick-summary">
              <div>
                <span className="material-symbols-outlined">task_alt</span>
                <strong>{playerProgress.completedActivities.length}</strong>
                <small>completadas</small>
              </div>
              <div>
                <span className="material-symbols-outlined">sports_esports</span>
                <strong>{availableActivities.length}</strong>
                <small>por jugar</small>
              </div>
              <div>
                <span className="material-symbols-outlined">military_tech</span>
                <strong>{playerProgress.badges.length}</strong>
                <small>insignias</small>
              </div>
            </div>
          </section>

          {/* Mis Materias */}
          {activeTab === 'materias' && <section className="materias-section">
            <div className="materias-header">
              <h2 className="materias-title">Mis Materias</h2>
              <span className="materias-badge">{materias.length} disponibles</span>
            </div>
            {contentError && (
              <div className="materias-load-error" role="alert">
                <p>{contentError}</p>
                <button
                  className="player-retry-button"
                  onClick={() => window.location.reload()}
                  type="button"
                >Reintentar</button>
              </div>
            )}
            {isLoadingContent && (
              <p className="materias-empty-state">Cargando materias disponibles…</p>
            )}
            {!isLoadingContent && !contentError && materias.length === 0 && (
              <p className="materias-empty-state">
                Todavía no hay materias activas. Vuelve pronto para descubrir nuevas aventuras.
              </p>
            )}

            {materias.map((m) => (
              <article key={m.id} className="materia-card">
                <div className="materia-top">
                  <div className="materia-info">
                    <div
                      className="materia-icon"
                      style={{
                        background: m.gradient,
                        boxShadow: `0 4px 0 ${m.shadowColor}`,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {m.icono}
                      </span>
                    </div>
                    <div className="materia-title-group">
                      <span
                        className={`materia-badge materia-badge-${m.badgeColor}`}
                      >
                        {m.badge}
                      </span>
                      <h3 className="materia-name">{m.titulo}</h3>
                    </div>
                  </div>
                  <button
                    aria-label={`Leer ${m.titulo}`}
                    className="voice-btn voice-btn-small"
                    style={{ color: m.shadowColor }}
                    onClick={(e) =>
                      speakTitle(`${m.titulo}: ${m.descripcion}`, e.currentTarget)
                    }
                    type="button"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      volume_up
                    </span>
                  </button>
                </div>

                {m.descripcion && <p className="materia-desc">{m.descripcion}</p>}

                <div className="materia-image-wrapper">
                  <img alt={m.titulo} className="materia-image" src={m.imagen || m.img} />
                  <div className="materia-image-overlay"></div>
                  <span className="materia-image-label">{m.name}</span>
                </div>

                <div className="materia-progress-box">
                  <div className="materia-progress-info">
                    <span
                      className="material-symbols-outlined materia-progress-icon"
                      style={{
                        color: m.insigniaColor,
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      {m.activities?.some((activity) => completedActivityIds.includes(activity.id) && activity.badge_name)
                        ? 'workspace_premium'
                        : m.insigniaIcono}
                    </span>
                    <div className="materia-progress-text">
                      <span className="materia-progress-title">
                        {m.activities
                          ?.find((activity) => completedActivityIds.includes(activity.id) && activity.badge_name)
                          ?.badge_name || m.insignia}
                      </span>
                      <span className="materia-progress-sub">
                        {m.activities
                          ? `${m.activities.filter((activity) => completedActivityIds.includes(activity.id)).length} de ${m.activities.length} actividades`
                          : `0 de ${m.activities?.length || 0} actividades`}
                      </span>
                    </div>
                  </div>
                  <div className="mini-progress">
                    <div
                      className="mini-progress-fill"
                      style={{
                        width: `${m.activities?.length
                          ? (m.activities.filter((activity) => completedActivityIds.includes(activity.id)).length / m.activities.length) * 100
                          : 0}%`,
                        background: m.progresoColor,
                      }}
                    ></div>
                  </div>
                </div>

                <button
                  className="play-btn"
                  style={{
                    background: m.colorFondo,
                    color: m.colorTexto,
                    boxShadow: `0 5px 0 ${m.shadowBoton}`,
                  }}
                  onClick={() => setExpandedSubjectId(
                    expandedSubjectId === m.id ? null : m.id,
                  )}
                  type="button"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    play_arrow
                  </span>
                  {`${expandedSubjectId === m.id ? 'OCULTAR RETOS' : 'VER RETOS'} · ${m.actividadesDisponibles}`}
                </button>
                {expandedSubjectId === m.id && (
                  <div className="player-activity-list">
                    {m.activities?.length ? m.activities.map((activity) => {
                      const completedCount = m.activities
                        .filter((item) => completedActivityIds.includes(item.id)).length;
                      const locked = activity.unlock_after > completedCount;
                      return (
                        <article className="player-activity-card" key={activity.id}>
                          {(activity.cover_image_url || activity.content?.image_url) && (
                            <img
                              alt=""
                              className="player-activity-card-cover"
                              src={activity.cover_image_url || activity.content.image_url}
                            />
                          )}
                          <div className="player-activity-copy">
                            <span className="player-activity-type">{gameTypeLabels[activity.game_type] || 'Minijuego'} · Nivel {activity.difficulty}</span>
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
                            onClick={() => startActivity({
                              ...activity,
                              subjectName: m.name,
                            })}
                            type="button"
                          >
                            {locked
                              ? <><span className="material-symbols-outlined">lock</span> Bloqueado</>
                              : completedActivityIds.includes(activity.id) ? 'Ver reto' : 'Empezar'}
                          </button>
                          {locked && (
                            <span className="player-unlock-hint">
                              Completa {activity.unlock_after} actividad{activity.unlock_after === 1 ? '' : 'es'} para desbloquear
                            </span>
                          )}
                        </article>
                      );
                    }) : (
                      <p className="player-no-activities">
                        Esta materia aún no tiene retos activos. ¡Pronto habrá nuevas aventuras!
                      </p>
                    )}
                  </div>
                )}
              </article>
            ))}
          </section>}
          {activeTab === 'misiones' && (
            <section className="player-tab-section" aria-labelledby="missions-title">
              <div className="player-tab-heading">
                <div>
                  <span className="materia-badge materia-badge-primary">Misiones activas</span>
                  <h2 id="missions-title">Retos para jugar</h2>
                </div>
                <span className="player-tab-count">{availableActivities.length} pendientes</span>
              </div>
              {contentError && <p className="materias-load-error" role="alert">{contentError}</p>}
              {isLoadingContent && <p className="materias-empty-state">Cargando misiones…</p>}
              {!isLoadingContent && availableActivities.length === 0 && (
                <p className="materias-empty-state">
                  {allActivities.length
                    ? '¡Completaste todos los retos disponibles! Revisa tu álbum de progreso.'
                    : 'Todavía no hay actividades disponibles en las materias activas.'}
                </p>
              )}
              <div className="player-tab-list">
                {availableActivities.map((activity) => (
                  <article className="player-tab-card" key={activity.id}>
                    <span className="player-tab-card-icon material-symbols-outlined">sports_esports</span>
                    <div className="player-tab-card-copy">
                      <span>{activity.subjectName} · {gameTypeLabels[activity.game_type] || 'Minijuego'}</span>
                      <strong>{activity.name}</strong>
                      <small>{activity.description || activity.instructions}</small>
                    </div>
                    <button
                      className="player-activity-start"
                      onClick={() => startActivity(activity)}
                      type="button"
                    >Jugar</button>
                  </article>
                ))}
              </div>
            </section>
          )}
          {activeTab === 'mi-album' && (
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
          )}
        </div>
      </main>

      {/* NAV INFERIOR */}
      <nav className="home-nav">
        <div className="home-nav-content">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`nav-item ${activeTab === t.id ? 'nav-item-active' : ''}`}
              onClick={() => {
                if (t.id === 'inicio') {
                  navigate('/');
                } else {
                  setActiveTab(t.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              type="button"
            >
              <span className="material-symbols-outlined nav-icon">{t.icon}</span>
              <span className="nav-label">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {selectedActivity && (
        <div
          className="player-activity-backdrop"
          onClick={closeActivity}
          onKeyDown={(event) => {
            if (event.key === 'Escape') closeActivity();
          }}
          role="presentation"
        >
          <section
            aria-labelledby="player-activity-title"
            aria-modal="true"
            className={`player-activity-dialog${activityResult ? ' player-result-dialog' : ''}`}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="Cerrar actividad"
              className="player-activity-close"
              onClick={closeActivity}
              type="button"
            >
              ×
            </button>
            {!activityResult ? (
              <>
                <span className="player-activity-dialog-icon material-symbols-outlined">
                  {selectedActivity.game_type === 'memorama' ? 'grid_view'
                    : selectedActivity.game_type === 'drag_drop' ? 'open_with'
                      : selectedActivity.game_type === 'quiz' ? 'quiz'
                        : selectedActivity.game_type === 'matching' ? 'join_inner' : 'sports_esports'}
                </span>
                <span className="player-activity-type">
                  {selectedActivity.subjectName || 'Actividad'} · {selectedActivity.gameTypeLabel} · Nivel {selectedActivity.difficulty}
                </span>
                <h2 id="player-activity-title">{selectedActivity.name}</h2>
                <p className="player-game-instructions">
                  {selectedActivity.instructions || selectedActivity.description}
                </p>
                {remainingSeconds !== null && !activityResult && (
                  <span className="player-game-timer" role="timer" aria-live="polite">
                    <span className="material-symbols-outlined">timer</span>
                    {remainingSeconds} s
                  </span>
                )}

                {selectedActivity.game_type === 'memorama' && memoramaPairs.length > 0 && (
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
                          onClick={() => flipMemoryCard(card)}
                          type="button"
                        >
                          {visible
                            ? <GameContent value={card.content} />
                            : <span className="material-symbols-outlined">help</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedActivity.game_type === 'drag_drop' && dragZones.length > 0 && dragItems.length > 0 && (
                  <div className="player-drag-game">
                    <div className="player-drag-items">
                      <strong>Elementos</strong>
                      <div className="player-game-chip-list">
                        {dragItems.filter((item) => !gameSession.placements[item.id]).map((item) => (
                          <button
                            className={`player-game-chip${gameSession.selectedItem === item.id ? ' is-selected' : ''}`}
                            draggable
                            key={item.id}
                            onClick={() => setGameSession({ ...gameSession, selectedItem: item.id, feedback: '' })}
                            onDragStart={(event) => event.dataTransfer.setData('text/plain', item.id)}
                            type="button"
                          >
                            <GameContent value={item.content} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="player-drop-zones">
                      {dragZones.map((zone) => (
                        <button
                          className="player-drop-zone"
                          key={zone.id}
                          onClick={() => placeDragItem(zone)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.preventDefault();
                            placeDragItem(zone, event.dataTransfer.getData('text/plain'));
                          }}
                          type="button"
                        >
                          <span className="player-drop-zone-content"><GameContent value={zone.content} /></span>
                          <strong>{zone.name}</strong>
                          {Object.entries(gameSession.placements)
                            .filter(([, zoneId]) => zoneId === zone.id)
                            .map(([itemId]) => {
                              const placedItem = dragItems.find((item) => item.id === itemId);
                              return <span className="player-placed-item" key={itemId}><GameContent value={placedItem?.content} /></span>;
                            })}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedActivity.game_type === 'quiz' && quizQuestions.length > 0 && (
                  <div className="player-quiz-game">
                    <div className="player-quiz-progress">
                      Pregunta {gameSession.quizIndex + 1} de {quizQuestions.length}
                    </div>
                    <h3>{quizQuestions[gameSession.quizIndex]?.question}</h3>
                    {quizQuestions[gameSession.quizIndex]?.image_url && (
                      <GameContent
                        className="player-quiz-image"
                        value={quizQuestions[gameSession.quizIndex].image_url}
                      />
                    )}
                    <div className="player-quiz-options">
                      {quizQuestions[gameSession.quizIndex]?.options?.map((option, index) => (
                        <button
                          className={`player-quiz-option${gameSession.selectedOption === index ? ' is-selected' : ''}`}
                          key={option.id || index}
                          onClick={() => setGameSession({ ...gameSession, selectedOption: index, feedback: '' })}
                          type="button"
                        ><GameContent value={option.content} /></button>
                      ))}
                    </div>
                    <button
                      className="player-game-primary-button"
                      disabled={gameSession.selectedOption === null}
                      onClick={answerQuizQuestion}
                      type="button"
                    >{gameSession.quizIndex + 1 === quizQuestions.length ? 'Ver resultado' : 'Siguiente pregunta'}
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                )}

                {selectedActivity.game_type === 'matching' && matchingPairs.length > 0 && (
                  <div className="player-matching-game">
                    <p>Toca un elemento de cada columna para unir la pareja.</p>
                    <div className="player-matching-columns">
                      <div>
                        {matchingPairs.map((pair) => (
                          <button
                            className={`player-matching-card${gameSession.selectedLeft === pair.id ? ' is-selected' : ''}${gameSession.matched.includes(pair.id) ? ' is-matched' : ''}`}
                            disabled={gameSession.matched.includes(pair.id)}
                            key={`left-${pair.id}`}
                            onClick={() => chooseMatchingLeft(pair)}
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
                            onClick={() => chooseMatchingRight(pair)}
                            type="button"
                          ><GameContent value={pair.right} /></button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {gameSession.feedback && (
                  <p className="player-game-feedback" role="status">{gameSession.feedback}</p>
                )}
                {!['memorama', 'drag_drop', 'quiz', 'matching'].includes(selectedActivity.game_type) && (
                  <p className="player-no-activities">
                    Esta actividad todavía no tiene una partida interactiva disponible.
                  </p>
                )}
              </>
            ) : (
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
                    onClick={() => {
                      closeActivity();
                    }}
                    type="button"
                  >Volver a las actividades <span className="material-symbols-outlined">arrow_forward</span></button>
                ) : (
                  <button
                    className="player-game-primary-button"
                    onClick={() => startActivity(selectedActivity)}
                    type="button"
                  >Intentar de nuevo <span className="material-symbols-outlined">replay</span></button>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
};

export default Materias;