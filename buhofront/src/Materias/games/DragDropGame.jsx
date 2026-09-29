import GameContent from './GameContent.jsx';

function DragDropGame({ dragItems, dragZones, gameSession, onPlaceDragItem, onSelectItem }) {
  return (
    <div className="player-drag-game">
      <div className="player-drag-items">
        <strong>Elementos</strong>
        <div className="player-game-chip-list">
          {dragItems.filter((item) => !gameSession.placements[item.id]).map((item) => (
            <button
              className={`player-game-chip${gameSession.selectedItem === item.id ? ' is-selected' : ''}`}
              draggable
              key={item.id}
              onClick={() => onSelectItem(item.id)}
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
            onClick={() => onPlaceDragItem(zone)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              onPlaceDragItem(zone, event.dataTransfer.getData('text/plain'));
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
  );
}

export default DragDropGame;
