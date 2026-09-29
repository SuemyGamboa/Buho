import ActivityList from './ActivityList.jsx';

function SubjectCard({
  completedActivityIds,
  expandedSubjectId,
  gameTypeLabels,
  onSpeak,
  onStartActivity,
  onToggleExpanded,
  subject,
}) {
  const completedActivities = subject.activities
    ?.filter((activity) => completedActivityIds.includes(activity.id)) || [];
  const earnedBadge = completedActivities.find((activity) => activity.badge_name);
  const progress = subject.activities?.length
    ? (completedActivities.length / subject.activities.length) * 100
    : 0;
  const isExpanded = expandedSubjectId === subject.id;

  return (
    <article className="materia-card">
      <div className="materia-top">
        <div className="materia-info">
          <div
            className="materia-icon"
            style={{
              background: subject.gradient,
              boxShadow: `0 4px 0 ${subject.shadowColor}`,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {subject.icono}
            </span>
          </div>
          <div className="materia-title-group">
            <span className={`materia-badge materia-badge-${subject.badgeColor}`}>
              {subject.badge}
            </span>
            <h3 className="materia-name">{subject.titulo}</h3>
          </div>
        </div>
        <button
          aria-label={`Leer ${subject.titulo}`}
          className="voice-btn voice-btn-small"
          style={{ color: subject.shadowColor }}
          onClick={(event) => onSpeak(
            `${subject.titulo}: ${subject.descripcion}`,
            event.currentTarget,
          )}
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

      {subject.descripcion && <p className="materia-desc">{subject.descripcion}</p>}

      <div className="materia-image-wrapper">
        <img alt={subject.titulo} className="materia-image" src={subject.imagen || subject.img} />
        <div className="materia-image-overlay"></div>
        <span className="materia-image-label">{subject.name}</span>
      </div>

      <div className="materia-progress-box">
        <div className="materia-progress-info">
          <span
            className="material-symbols-outlined materia-progress-icon"
            style={{
              color: subject.insigniaColor,
              fontVariationSettings: "'FILL' 1",
            }}
          >
            {earnedBadge ? 'workspace_premium' : subject.insigniaIcono}
          </span>
          <div className="materia-progress-text">
            <span className="materia-progress-title">
              {earnedBadge?.badge_name || subject.insignia}
            </span>
            <span className="materia-progress-sub">
              {subject.activities
                ? `${completedActivities.length} de ${subject.activities.length} actividades`
                : `0 de ${subject.activities?.length || 0} actividades`}
            </span>
          </div>
        </div>
        <div className="mini-progress">
          <div
            className="mini-progress-fill"
            style={{ width: `${progress}%`, background: subject.progresoColor }}
          ></div>
        </div>
      </div>

      <button
        className="play-btn"
        style={{
          background: subject.colorFondo,
          color: subject.colorTexto,
          boxShadow: `0 5px 0 ${subject.shadowBoton}`,
        }}
        onClick={() => onToggleExpanded(subject.id)}
        type="button"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          play_arrow
        </span>
        {`${isExpanded ? 'OCULTAR RETOS' : 'VER RETOS'} · ${subject.actividadesDisponibles}`}
      </button>
      {isExpanded && (
        <ActivityList
          activities={subject.activities}
          completedActivityIds={completedActivityIds}
          gameTypeLabels={gameTypeLabels}
          onStartActivity={(activity) => onStartActivity({
            ...activity,
            subjectName: subject.name,
          })}
        />
      )}
    </article>
  );
}

export default SubjectCard;
