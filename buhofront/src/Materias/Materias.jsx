import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityDialog from './components/ActivityDialog.jsx';
import AlbumTab from './components/AlbumTab.jsx';
import GreetingCard from './components/GreetingCard.jsx';
import MascotCard from './components/MascotCard.jsx';
import MissionsTab from './components/MissionsTab.jsx';
import PlayerSummary from './components/PlayerSummary.jsx';
import SubjectList from './components/SubjectList.jsx';
import { fetchSubjects } from './api/subjects.js';
import useActivityTimer from './hooks/useActivityTimer.js';
import useGameSession from './hooks/useGameSession.js';
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

const getMissionOrder = (seed, activity) => {
  const key = `${seed}:${activity.subjectId}:${activity.id}`;
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const Materias = () => {
  const [activeTab, setActiveTab] = useState('inicio');
  const navigate = useNavigate();
  const [contentError, setContentError] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [randomMissionQueue, setRandomMissionQueue] = useState(null);
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
  const [missionShuffleSeed, setMissionShuffleSeed] = useState(0);
  const {
    activityContent,
    activityResult,
    answerQuizQuestion,
    chooseMatchingLeft,
    chooseMatchingRight,
    dragItems,
    dragZones,
    finishActivity,
    flipMemoryCard,
    gameSession,
    gameSessionRef,
    gameTimerRef,
    matchingPairs,
    memoramaPairs,
    memoryTimerRef,
    placeDragItem,
    quizQuestions,
    resetGameSession,
    setActivityResult,
    setGameSession,
  } = useGameSession({ selectedActivity, setCompletedActivityIds });
  const activityTimeLimit = Number(
    selectedActivity?.time_limit_seconds || activityContent.time_limit || 0,
  );
  const { remainingSeconds, setRemainingSeconds } = useActivityTimer({
    activityResult,
    dragItems,
    finishActivity,
    gameSessionRef,
    gameTimerRef,
    memoramaPairs,
    quizQuestions,
    selectedActivity,
    timeLimit: activityTimeLimit,
  });
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
    setRandomMissionQueue(null);
    setSelectedActivity(null);
    setActivityResult(null);
  };
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
  const missionActivities = useMemo(() => {
    return allActivities
      .filter((activity) => !completedActivityIds.includes(activity.id))
      .sort((left, right) => (
        getMissionOrder(missionShuffleSeed, left) - getMissionOrder(missionShuffleSeed, right)
      ));
  }, [allActivities, completedActivityIds, missionShuffleSeed]);
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
    resetGameSession(cards);
    const timeLimit = Number(activityData.time_limit_seconds || content.time_limit || 0);
    setRemainingSeconds(timeLimit > 0 ? timeLimit : null);
    setActivityResult(null);
  };
  const startRandomMissionRun = () => {
    const shuffledMissions = [...missionActivities];
    for (let index = shuffledMissions.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffledMissions[index], shuffledMissions[randomIndex]] = [
        shuffledMissions[randomIndex],
        shuffledMissions[index],
      ];
    }

    if (shuffledMissions.length === 0) return;
    setRandomMissionQueue(shuffledMissions.slice(1));
    startActivity(shuffledMissions[0]);
  };
  const startNextRandomMission = () => {
    if (!randomMissionQueue?.length) {
      setRandomMissionQueue(null);
      closeActivity();
      return;
    }

    const [nextMission, ...remainingMissions] = randomMissionQueue;
    setRandomMissionQueue(remainingMissions);
    startActivity(nextMission);
  };
  const startSingleActivity = (activity) => {
    setRandomMissionQueue(null);
    startActivity(activity);
  };
  useEffect(() => {
    let cancelled = false;

    fetchSubjects()
      .then((data) => {
        if (cancelled) return;
        setMissionShuffleSeed(Math.random());
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
    { id: 'misiones', label: 'Misiones', icon: 'flag_circle' },
    { id: 'materias', label: 'Materias', icon: 'category' },
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
              <span className="home-logo-title">Buho</span>
              <span className="home-logo-badge">
                Kids Learning
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
              aria-label="Volver al perfil de bienvenida"
              className="home-profile home-profile-button"
              onClick={() => navigate('/')}
              title="Volver a la pantalla de bienvenida"
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
          <GreetingCard
            missionCount={missionActivities.length}
            onSpeak={playVoiceGreeting}
            playerName={playerName}
          />

          {activeTab === 'inicio' && (
            <MascotCard
              missionActivities={missionActivities}
              onStart={() => {
                setActiveTab('misiones');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              playerName={playerName}
            />
          )}

          {/* Resumen del perfil del jugador */}
          {activeTab === 'inicio' && (
            <PlayerSummary
              allActivitiesCount={allActivities.length}
              materiasCount={materias.length}
              missionCount={missionActivities.length}
              playerName={playerName}
              playerProgress={playerProgress}
            />
          )}

          {activeTab === 'materias' && (
            <SubjectList
              completedActivityIds={completedActivityIds}
              contentError={contentError}
              expandedSubjectId={expandedSubjectId}
              gameTypeLabels={gameTypeLabels}
              isLoadingContent={isLoadingContent}
              materias={materias}
              onSpeak={speakTitle}
              onStartActivity={startSingleActivity}
              onToggleExpanded={(subjectId) => setExpandedSubjectId(
                expandedSubjectId === subjectId ? null : subjectId,
              )}
            />
          )}
          {activeTab === 'misiones' && (
            <MissionsTab
              allActivitiesCount={allActivities.length}
              contentError={contentError}
              gameTypeLabels={gameTypeLabels}
              isLoadingContent={isLoadingContent}
              missionActivities={missionActivities}
              onPlayAll={startRandomMissionRun}
              onStartActivity={startSingleActivity}
            />
          )}
          {activeTab === 'mi-album' && (
            <AlbumTab
              gameTypeLabels={gameTypeLabels}
              playerProgress={playerProgress}
            />
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
                setActiveTab(t.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              type="button"
            >
              <span className="material-symbols-outlined nav-icon">{t.icon}</span>
              <span className="nav-label">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
      <ActivityDialog
        activityResult={activityResult}
        closeActivity={closeActivity}
        dragItems={dragItems}
        dragZones={dragZones}
        gameSession={gameSession}
        matchingPairs={matchingPairs}
        memoramaPairs={memoramaPairs}
        onAnswerQuizQuestion={answerQuizQuestion}
        onChooseMatchingLeft={chooseMatchingLeft}
        onChooseMatchingRight={chooseMatchingRight}
        onFlipMemoryCard={flipMemoryCard}
        onPlaceDragItem={placeDragItem}
        onRetry={() => startActivity(selectedActivity)}
        onSelectItem={(itemId) => setGameSession({
          ...gameSession,
          selectedItem: itemId,
          feedback: '',
        })}
        onSelectOption={(selectedOption) => setGameSession({
          ...gameSession,
          selectedOption,
          feedback: '',
        })}
        onSkip={startNextRandomMission}
        onStartNextRandomMission={startNextRandomMission}
        playerName={playerName}
        quizQuestions={quizQuestions}
        randomMissionQueue={randomMissionQueue}
        remainingSeconds={remainingSeconds}
        selectedActivity={selectedActivity}
      />
    </>
  );
};

export default Materias;