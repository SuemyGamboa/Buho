import ActivityCard from './ActivityCard.jsx';

function ActivityList({ activities, completedActivityIds, gameTypeLabels, onStartActivity }) {
  const completedCount = (activities || [])
    .filter((activity) => completedActivityIds.includes(activity.id)).length;

  return (
    <div className="player-activity-list">
      {activities?.length ? activities.map((activity) => (
          <ActivityCard
            activity={activity}
            gameTypeLabels={gameTypeLabels}
            key={activity.id}
            locked={activity.unlock_after > completedCount}
            onStart={() => onStartActivity(activity)}
            wasCompleted={completedActivityIds.includes(activity.id)}
          />
        )) : (
          <p className="player-no-activities">
            Esta materia aún no tiene retos activos. ¡Pronto habrá nuevas aventuras!
          </p>
        )}
    </div>
  );
}

export default ActivityList;
