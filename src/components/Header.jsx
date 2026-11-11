export default function Header({ score, level }) {
  return (
    <header className="header">
      <h1>CrossBlock (TetraCore)</h1>
      <div className="stats">
        <span>Puntos: {score}</span>
        <span>Nivel: {level}</span>
      </div>
    </header>
  );
}
