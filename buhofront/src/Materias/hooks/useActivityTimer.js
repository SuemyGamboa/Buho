import { useEffect, useState } from 'react';
import { getResultSummary } from './useGameSession.js';

function useActivityTimer({
  activityResult,
  dragItems,
  finishActivity,
  gameTimerRef,
  gameSessionRef,
  memoramaPairs,
  quizQuestions,
  selectedActivity,
  timeLimit,
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(null);

  useEffect(() => {
    if (!selectedActivity || activityResult || timeLimit <= 0) {
      return undefined;
    }

    const deadline = Date.now() + timeLimit * 1000;
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
    dragItems.length,
    finishActivity,
    gameTimerRef,
    gameSessionRef,
    memoramaPairs.length,
    quizQuestions.length,
    selectedActivity,
    timeLimit,
  ]);

  return { gameTimerRef, remainingSeconds, setRemainingSeconds };
}

export default useActivityTimer;
