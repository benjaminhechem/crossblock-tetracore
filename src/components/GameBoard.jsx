import { useEffect } from 'react';
import Cannon from './Cannon';

export default function GameBoard({ 
  coreGrid, 
  cannonColors, 
  isPaused, 
  isGameOver, 
  onShoot, 
  nextColor 
}) {

  // Soporte para disparar con las flechas del teclado (↑ ↓ ← →)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPaused || isGameOver) return;
      if (e.key === 'ArrowUp') onShoot('top');
      if (e.key === 'ArrowDown') onShoot('bottom');
      if (e.key === 'ArrowLeft') onShoot('left');
      if (e.key === 'ArrowRight') onShoot('right');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, isGameOver, onShoot]);

  return (
    <section className="game-wrapper">
      {/* Panel Lateral: Próxima pieza */}
      <aside className="preview-panel">
        <h3>Próximo Bloque</h3>
        <div className="preview-box">
          <div 
            className="color-preview-block" 
            style={{ backgroundColor: nextColor }}
          />
        </div>
        <p className="controls-hint">Usa las <b>Flechas del Teclado</b> o haz clic en los cañones para disparar.</p>
      </aside>

      {/* Arena de Juego */}
      <div className="arena">
        <Cannon position="top" color={cannonColors.top} onClick={onShoot} />
        <Cannon position="left" color={cannonColors.left} onClick={onShoot} />

        {/* Grilla Central del Núcleo (3x3) */}
        <div className="core-grid">
          {isGameOver ? (
            <div className="game-over-overlay">
              <h2>¡GAME OVER!</h2>
              <p>El núcleo se ha colapsado</p>
            </div>
          ) : isPaused ? (
            <div className="pause-overlay">PAUSADO</div>
          ) : (
            <div className="grid-cells">
              {coreGrid.map((color, index) => (
                <div 
                  key={index} 
                  className="grid-cell" 
                  style={{ backgroundColor: color || '#222' }}
                />
              ))}
            </div>
          )}
        </div>

        <Cannon position="right" color={cannonColors.right} onClick={onShoot} />
        <Cannon position="bottom" color={cannonColors.bottom} onClick={onShoot} />
      </div>
    </section>
  );
}