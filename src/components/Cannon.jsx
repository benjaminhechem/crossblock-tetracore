export default function Cannon({ position, color, onClick }) {
  return (
    <button 
      className={`cannon cannon-${position}`} 
      style={{ backgroundColor: color }}
      onClick={() => onClick(position)}
      title={`Disparar cañón ${position}`}
    >
      <span className="cannon-label">{position.toUpperCase()}</span>
    </button>
  );
}