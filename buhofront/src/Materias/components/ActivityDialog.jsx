import DragDropGame from '../games/DragDropGame.jsx';
import MatchingGame from '../games/MatchingGame.jsx';
import MemoramaGame from '../games/MemoramaGame.jsx';
import QuizGame from '../games/QuizGame.jsx';
import ResultScreen from '../games/ResultScreen.jsx';

function ActivityDialog({
  activityResult,
  closeActivity,
  dragItems,
  dragZones,
  gameSession,
  matchingPairs,
  memoramaPairs,
  onAnswerQuizQuestion,
  onChooseMatchingLeft,
  onChooseMatchingRight,
  onFlipMemoryCard,
  onPlaceDragItem,
  onRetry,
  onSelectItem,
  onSelectOption,
  onSkip,
  onStartNextRandomMission,
  playerName,
  quizQuestions,
  randomMissionQueue,
  remainingSeconds,
  selectedActivity,
}) {
  if (!selectedActivity) return null;

  return (
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
              <MemoramaGame gameSession={gameSession} onFlipMemoryCard={onFlipMemoryCard} />
            )}
            {selectedActivity.game_type === 'drag_drop' && dragZones.length > 0 && dragItems.length > 0 && (
              <DragDropGame
                dragItems={dragItems}
                dragZones={dragZones}
                gameSession={gameSession}
                onPlaceDragItem={onPlaceDragItem}
                onSelectItem={onSelectItem}
              />
            )}
            {selectedActivity.game_type === 'quiz' && quizQuestions.length > 0 && (
              <QuizGame
                gameSession={gameSession}
                onAnswerQuizQuestion={onAnswerQuizQuestion}
                onSelectOption={onSelectOption}
                quizQuestions={quizQuestions}
              />
            )}
            {selectedActivity.game_type === 'matching' && matchingPairs.length > 0 && (
              <MatchingGame
                gameSession={gameSession}
                matchingPairs={matchingPairs}
                onChooseMatchingLeft={onChooseMatchingLeft}
                onChooseMatchingRight={onChooseMatchingRight}
              />
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
          <ResultScreen
            activityResult={activityResult}
            onClose={closeActivity}
            onRetry={onRetry}
            onSkip={onSkip}
            onStartNextRandomMission={onStartNextRandomMission}
            playerName={playerName}
            randomMissionQueue={randomMissionQueue}
            selectedActivity={selectedActivity}
          />
        )}
      </section>
    </div>
  );
}

export default ActivityDialog;
