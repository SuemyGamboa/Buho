import { useCallback, useEffect, useRef, useState } from 'react';

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

export const getResultSummary = (gameType, session, totals) => {
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

function useGameSession({ selectedActivity, setCompletedActivityIds }) {
  const [gameSession, setGameSession] = useState(makeGameSession);
  const [activityResult, setActivityResult] = useState(null);
  const memoryTimerRef = useRef(null);
  const gameTimerRef = useRef(null);
  const gameSessionRef = useRef(gameSession);
  const activityContent = selectedActivity?.content
    && Object.keys(selectedActivity.content).length
    ? selectedActivity.content
    : selectedActivity?.config || {};
  const memoramaPairs = activityContent.pairs || [];
  const matchingPairs = activityContent.pairs || [];
  const quizQuestions = activityContent.questions || [];
  const dragZones = activityContent.zones || [];
  const dragItems = activityContent.items || [];

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
  }, [selectedActivity, setCompletedActivityIds]);

  useEffect(() => {
    gameSessionRef.current = gameSession;
  }, [gameSession]);

  useEffect(() => () => window.clearTimeout(memoryTimerRef.current), []);

  const resetGameSession = (cards) => {
    setGameSession({ ...makeGameSession(), cards });
  };

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

  return {
    activityContent,
    activityResult,
    answerQuizQuestion,
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
    chooseMatchingLeft,
    chooseMatchingRight,
  };
}

export default useGameSession;
