export default function Controls({ onTogglePause, isPaused, onReset, isGameOver }) {
  return (
    <section className="controls">
      <button className="btn-control" onClick={onTogglePause} disabled={isGameOver}>
        {isPaused ? '▶ Reanudar' : '⏸ Pausar'}
      </button>

      <button className="btn-control btn-reset" onClick={onReset}>
        🔄 Reiniciar Partida
      </button>
    </section>
  );
}