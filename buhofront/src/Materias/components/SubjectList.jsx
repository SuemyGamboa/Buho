import SubjectCard from './SubjectCard.jsx';

function SubjectList({
  completedActivityIds,
  contentError,
  expandedSubjectId,
  gameTypeLabels,
  isLoadingContent,
  materias,
  onSpeak,
  onStartActivity,
  onToggleExpanded,
}) {
  return (
    <section className="materias-section">
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
      {materias.map((subject) => (
        <SubjectCard
          completedActivityIds={completedActivityIds}
          expandedSubjectId={expandedSubjectId}
          gameTypeLabels={gameTypeLabels}
          key={subject.id}
          onSpeak={onSpeak}
          onStartActivity={onStartActivity}
          onToggleExpanded={onToggleExpanded}
          subject={subject}
        />
      ))}
    </section>
  );
}

export default SubjectList;
