import GameContent from './GameContent.jsx';

function QuizGame({ gameSession, onAnswerQuizQuestion, onSelectOption, quizQuestions }) {
  return (
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
            onClick={() => onSelectOption(index)}
            type="button"
          ><GameContent value={option.content} /></button>
        ))}
      </div>
      <button
        className="player-game-primary-button"
        disabled={gameSession.selectedOption === null}
        onClick={onAnswerQuizQuestion}
        type="button"
      >{gameSession.quizIndex + 1 === quizQuestions.length ? 'Ver resultado' : 'Siguiente pregunta'}
        <span className="material-symbols-outlined">arrow_forward</span>
      </button>
    </div>
  );
}

export default QuizGame;
