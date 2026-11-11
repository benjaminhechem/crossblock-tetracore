import { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 7; // Grilla 7x7 (49 casillas)
const MID_POINT = Math.floor(GRID_SIZE / 2); // Centro exacto (índice 3)
const CORE_INDEX = MID_POINT * GRID_SIZE + MID_POINT; // Núcleo estático central 1x1
const CORE_COLOR = '#475569'; // Metal estático

// Paleta de 5 colores neón
const COLOR_PALETTE = [
  '#ef4444', // Rojo
  '#3b82f6', // Azul
  '#10b981', // Verde
  '#f59e0b', // Amarillo
  '#a855f7', // Violeta
];

// Algoritmo de detección de grupos contiguos (Líneas, formas en L o esquinas)
function findConnectedMatches(board) {
  const visited = new Array(GRID_SIZE * GRID_SIZE).fill(false);
  const matchedIndices = new Set();
  let triosFound = 0;

  for (let i = 0; i < board.length; i++) {
    const color = board[i];
    if (!color || color === 'CORE' || visited[i]) continue;

    const cluster = [];
    const queue = [i];
    visited[i] = true;

    while (queue.length > 0) {
      const current = queue.shift();
      cluster.push(current);

      const r = Math.floor(current / GRID_SIZE);
      const c = current % GRID_SIZE;

      const neighbors = [
        { nr: r - 1, nc: c },
        { nr: r + 1, nc: c },
        { nr: r, nc: c - 1 },
        { nr: r, nc: c + 1 },
      ];

      for (const { nr, nc } of neighbors) {
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
          const nIdx = nr * GRID_SIZE + nc;
          if (!visited[nIdx] && board[nIdx] === color) {
            visited[nIdx] = true;
            queue.push(nIdx);
          }
        }
      }
    }

    if (cluster.length >= 3) {
      cluster.forEach((idx) => matchedIndices.add(idx));
      triosFound += Math.floor(cluster.length / 3);
    }
  }

  return { matchedIndices, triosFound };
}

export default function Game() {
  const [playerInitials, setPlayerInitials] = useState('BEN');
  const [hasEnteredName, setHasEnteredName] = useState(false);
  const [ranking, setRanking] = useState(() => {
    const saved = localStorage.getItem('tetracore_ranking');
    return saved ? JSON.parse(saved) : [
      { name: 'CPU', score: 1200, level: 3 },
      { name: 'PRO', score: 700, level: 2 },
      { name: 'ACE', score: 300, level: 1 }
    ];
  });

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [combosInLevel, setCombosInLevel] = useState(0);
  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Meta: Nivel 1 = 3 tríos | Nivel 2 = 5 tríos | Nivel 3 = 7 tríos...
  const targetCombos = 1 + level * 2;

  const [grid, setGrid] = useState(() => {
    const initial = Array(GRID_SIZE * GRID_SIZE).fill(null);
    initial[CORE_INDEX] = 'CORE';
    return initial;
  });

  const [activePiece, setActivePiece] = useState(null);
  const [nextColor, setNextColor] = useState(COLOR_PALETTE[0]);

  // Referencias mutables para que el reloj sea 100% inmune a las teclas
  const gridRef = useRef(grid);
  gridRef.current = grid;

  const activePieceRef = useRef(activePiece);
  activePieceRef.current = activePiece;

  const scoreRef = useRef(score);
  scoreRef.current = score;

  const combosRef = useRef(combosInLevel);
  combosRef.current = combosInLevel;

  const levelRef = useRef(level);
  levelRef.current = level;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const isGameOverRef = useRef(isGameOver);
  isGameOverRef.current = isGameOver;

  const isLevelClearedRef = useRef(isLevelCleared);
  isLevelClearedRef.current = isLevelCleared;

  const getRandomColor = () => COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

  const saveToRanking = useCallback((finalScore, finalLevel) => {
    if (finalScore <= 0) return;
    setRanking((prev) => {
      const updated = [...prev, { name: playerInitials, score: finalScore, level: finalLevel }]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      localStorage.setItem('tetracore_ranking', JSON.stringify(updated));
      return updated;
    });
  }, [playerInitials]);

  const spawnPiece = useCallback((forcedDir = null) => {
    if (isPausedRef.current || isGameOverRef.current || isLevelClearedRef.current || !hasEnteredName) return;

    const directions = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT'];
    const dir = forcedDir || directions[Math.floor(Math.random() * directions.length)];

    let row = 0, col = 0;
    if (dir === 'TOP') { row = 0; col = MID_POINT; }
    if (dir === 'BOTTOM') { row = GRID_SIZE - 1; col = MID_POINT; }
    if (dir === 'LEFT') { row = MID_POINT; col = 0; }
    if (dir === 'RIGHT') { row = MID_POINT; col = GRID_SIZE - 1; }

    if (gridRef.current[row * GRID_SIZE + col] !== null && gridRef.current[row * GRID_SIZE + col] !== 'CORE') {
      isGameOverRef.current = true;
      setIsGameOver(true);
      return;
    }

    const color = nextColor;
    setNextColor(getRandomColor());
    const newPiece = { row, col, color, dir };
    activePieceRef.current = newPiece;
    setActivePiece(newPiece);
  }, [hasEnteredName, nextColor]);

  useEffect(() => {
    if (!activePiece && !isGameOver && !isPaused && !isLevelCleared && hasEnteredName) {
      spawnPiece();
    }
  }, [activePiece, isGameOver, isPaused, isLevelCleared, hasEnteredName, spawnPiece]);

  useEffect(() => {
    if (isGameOver) {
      saveToRanking(scoreRef.current, levelRef.current);
    }
  }, [isGameOver, saveToRanking]);

  // Fijar pieza y calcular tríos y nivel
  const lockPiece = useCallback((piece) => {
    const currentGrid = [...gridRef.current];
    const index = piece.row * GRID_SIZE + piece.col;
    currentGrid[index] = piece.color;

    // Búsqueda inmediata de tríos en fila o en 'L'
    const { matchedIndices, triosFound } = findConnectedMatches(currentGrid);

    let newScore = scoreRef.current;
    let newCombos = combosRef.current;
    let didLevelUp = false;

    if (matchedIndices.size > 0) {
      matchedIndices.forEach((idx) => {
        currentGrid[idx] = null;
      });

      newScore += matchedIndices.size * 100;
      newCombos += Math.max(1, triosFound);

      const target = 1 + levelRef.current * 2;
      if (newCombos >= target) {
        didLevelUp = true;
        newScore += 500 * levelRef.current;
      }
    }

    // Actualización síncrona de referencias
    gridRef.current = currentGrid;
    scoreRef.current = newScore;
    combosRef.current = newCombos;
    activePieceRef.current = null;

    // Actualización de estado en React
    setGrid(currentGrid);
    setScore(newScore);
    setCombosInLevel(newCombos);
    setActivePiece(null);

    if (didLevelUp) {
      isLevelClearedRef.current = true;
      setIsLevelCleared(true);
    }
  }, []);

  // Avance del bloque hacia el centro
  const stepForward = useCallback(() => {
    const piece = activePieceRef.current;
    if (!piece || isPausedRef.current || isGameOverRef.current || isLevelClearedRef.current) return;

    let { row, col, dir } = piece;
    let nextRow = row;
    let nextCol = col;

    if (dir === 'TOP') nextRow++;
    if (dir === 'BOTTOM') nextRow--;
    if (dir === 'LEFT') nextCol++;
    if (dir === 'RIGHT') nextCol--;

    const isOutOfBounds = nextRow < 0 || nextRow >= GRID_SIZE || nextCol < 0 || nextCol >= GRID_SIZE;
    const isOccupied = !isOutOfBounds && gridRef.current[nextRow * GRID_SIZE + nextCol] !== null;

    if (isOutOfBounds || isOccupied) {
      lockPiece(piece);
    } else {
      const moved = { ...piece, row: nextRow, col: nextCol };
      activePieceRef.current = moved;
      setActivePiece(moved);
    }
  }, [lockPiece]);

  // Gameloop: El temporizador NO depende de activePiece y NO se reinicia al tocar teclas
  useEffect(() => {
    if (isPaused || isGameOver || isLevelCleared || !hasEnteredName) return;

    const currentSpeed = Math.max(70, 420 - (level - 1) * 65);
    const interval = setInterval(() => {
      stepForward();
    }, currentSpeed);

    return () => clearInterval(interval);
  }, [stepForward, isPaused, isGameOver, isLevelCleared, hasEnteredName, level]);

  // Controles de teclado: Permiten desplazarse y acelerar sin frenar el avance automático
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      const piece = activePieceRef.current;
      if (!piece || isPausedRef.current || isGameOverRef.current || isLevelClearedRef.current) return;

      const { row, col, dir } = piece;
      let newRow = row;
      let newCol = col;
      let shouldStep = false;

      // Movimiento perpendicular y aceleración frontal
      if (e.key === 'ArrowLeft') {
        if (dir === 'TOP' || dir === 'BOTTOM') newCol = Math.max(0, col - 1);
        if (dir === 'RIGHT') shouldStep = true;
      }
      if (e.key === 'ArrowRight') {
        if (dir === 'TOP' || dir === 'BOTTOM') newCol = Math.min(GRID_SIZE - 1, col + 1);
        if (dir === 'LEFT') shouldStep = true;
      }
      if (e.key === 'ArrowUp') {
        if (dir === 'LEFT' || dir === 'RIGHT') newRow = Math.max(0, row - 1);
        if (dir === 'BOTTOM') shouldStep = true;
      }
      if (e.key === 'ArrowDown') {
        if (dir === 'LEFT' || dir === 'RIGHT') newRow = Math.min(GRID_SIZE - 1, row + 1);
        if (dir === 'TOP') shouldStep = true;
      }

      if (shouldStep) {
        stepForward(); // Acelera hacia el frente
      } else if (newRow !== row || newCol !== col) {
        const targetIdx = newRow * GRID_SIZE + newCol;
        if (gridRef.current[targetIdx] === null) {
          const shifted = { ...piece, row: newRow, col: newCol };
          activePieceRef.current = shifted;
          setActivePiece(shifted);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepForward]);

  const handleNextLevel = () => {
    const fresh = Array(GRID_SIZE * GRID_SIZE).fill(null);
    fresh[CORE_INDEX] = 'CORE';

    const nextLvl = level + 1;
    gridRef.current = fresh;
    combosRef.current = 0;
    levelRef.current = nextLvl;
    isLevelClearedRef.current = false;
    activePieceRef.current = null;

    setGrid(fresh);
    setLevel(nextLvl);
    setCombosInLevel(0);
    setIsLevelCleared(false);
    setActivePiece(null);
  };

  const handleReset = () => {
    const initial = Array(GRID_SIZE * GRID_SIZE).fill(null);
    initial[CORE_INDEX] = 'CORE';

    gridRef.current = initial;
    combosRef.current = 0;
    scoreRef.current = 0;
    levelRef.current = 1;
    isPausedRef.current = false;
    isGameOverRef.current = false;
    isLevelClearedRef.current = false;
    activePieceRef.current = null;

    setGrid(initial);
    setScore(0);
    setLevel(1);
    setCombosInLevel(0);
    setIsLevelCleared(false);
    setIsPaused(false);
    setIsGameOver(false);
    setActivePiece(null);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (playerInitials.trim().length > 0) {
      setHasEnteredName(true);
    }
  };

  const getCellTrackStatus = (r, c) => {
    const isMainLane = (c === MID_POINT && r !== MID_POINT) || (r === MID_POINT && c !== MID_POINT);

    let isActiveLane = false;
    if (activePiece) {
      const { row, col, dir } = activePiece;
      if (dir === 'TOP' && c === col && r >= 0 && r < MID_POINT) isActiveLane = true;
      if (dir === 'BOTTOM' && c === col && r > MID_POINT && r < GRID_SIZE) isActiveLane = true;
      if (dir === 'LEFT' && r === row && c >= 0 && c < MID_POINT) isActiveLane = true;
      if (dir === 'RIGHT' && r === row && c > MID_POINT && c < GRID_SIZE) isActiveLane = true;
    }

    return { isMainLane, isActiveLane };
  };

  if (!hasEnteredName) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#fff', backgroundColor: '#0f172a', height: '100vh', boxSizing: 'border-box', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: '#38bdf8', fontSize: '2.2rem', marginBottom: '10px' }}>CROSSBLOCK (TETRACORE)</h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '25px' }}>Ingresá tus iniciales para el Ranking Arcade</p>

        <form onSubmit={handleNameSubmit} style={{ background: '#1e293b', padding: '25px', borderRadius: '12px', border: '2px solid #3b82f6', display: 'flex', flexDirection: 'column', gap: '15px', width: '280px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#f8fafc' }}>TU NOMBRE / INICIALES (3 LETRAS):</label>
          <input
            type="text"
            maxLength={3}
            value={playerInitials}
            onChange={(e) => setPlayerInitials(e.target.value.toUpperCase())}
            style={{ fontSize: '1.8rem', textAlign: 'center', fontWeight: 'bold', letterSpacing: '6px', padding: '8px', borderRadius: '6px', border: '2px solid #2563eb', background: '#020617', color: '#38bdf8' }}
            required
          />
          <button type="submit" style={{ padding: '10px', fontSize: '1rem', fontWeight: 'bold', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            ¡EMPEZAR A JUGAR!
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px', textAlign: 'center', color: '#fff', backgroundColor: '#0f172a', height: '100vh', maxHeight: '100vh', overflow: 'hidden', boxSizing: 'border-box', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
      
      <h2 style={{ margin: '2px 0 4px 0', color: '#38bdf8', fontSize: '1.3rem' }}>CrossBlock (TetraCore) — Arena 7x7</h2>

      <div style={{ margin: '2px 0', fontSize: '0.95rem', display: 'flex', justifyContent: 'center', gap: '18px', alignItems: 'center' }}>
        <span>Jugador: <b style={{ color: '#38bdf8' }}>{playerInitials}</b></span> | 
        <span>Puntos: <b style={{ color: '#10b981' }}>{score}</b></span> | 
        <span>Nivel: <b style={{ color: '#f59e0b' }}>{level}</b></span> | 
        <span>Meta: <b style={{ color: '#ec4899' }}>{combosInLevel} / {targetCombos} tríos</b></span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center', flex: 1, maxHeight: 'calc(100vh - 120px)' }}>

        {/* Panel lateral: Próxima Pieza y Disparo */}
        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #3b82f6', width: '120px' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem' }}>Próxima Pieza</p>
          <div style={{ width: '32px', height: '32px', backgroundColor: nextColor, margin: '0 auto', borderRadius: '4px', boxShadow: '0 0 8px rgba(255,255,255,0.4)' }} />
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '10px', marginBottom: '4px' }}>Disparo Manual:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
            <button onClick={() => spawnPiece('TOP')} style={btnCannonStyle}>TOP</button>
            <button onClick={() => spawnPiece('BOTTOM')} style={btnCannonStyle}>BOT</button>
            <button onClick={() => spawnPiece('LEFT')} style={btnCannonStyle}>IZQ</button>
            <button onClick={() => spawnPiece('RIGHT')} style={btnCannonStyle}>DER</button>
          </div>
        </div>

        {/* Tablero 7x7 */}
        <div style={{ position: 'relative', padding: '24px', backgroundColor: '#1e293b', borderRadius: '10px', border: '2px solid #334155' }}>
          
          <div onClick={() => spawnPiece('TOP')} style={{ position: 'absolute', top: '3px', left: '50%', transform: 'translateX(-50%)', width: '38px', height: '18px', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.6rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3px', cursor: 'pointer' }}>▲ TOP</div>
          <div onClick={() => spawnPiece('BOTTOM')} style={{ position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)', width: '38px', height: '18px', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.6rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3px', cursor: 'pointer' }}>▼ BOT</div>
          <div onClick={() => spawnPiece('LEFT')} style={{ position: 'absolute', left: '3px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '38px', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.6rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3px', cursor: 'pointer', writingMode: 'vertical-lr' }}>◄ IZQ</div>
          <div onClick={() => spawnPiece('RIGHT')} style={{ position: 'absolute', right: '3px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '38px', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.6rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3px', cursor: 'pointer', writingMode: 'vertical-lr' }}>► DER</div>

          <div style={{ width: '350px', height: '350px', backgroundColor: '#020617', border: '2px solid #1d4ed8', borderRadius: '6px', padding: '3px', boxSizing: 'border-box' }}>
            
            {/* Modal de Nivel Superado */}
            {isLevelCleared ? (
              <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(16, 185, 129, 0.95)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '4px' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#ffffff' }}>⭐ ¡NIVEL {level} SUPERADO! ⭐</h2>
                <p style={{ margin: '6px 0', fontSize: '0.9rem', color: '#ffffff' }}>Bonificación: <b>+{500 * level} PTS</b></p>
                <p style={{ margin: '2px 0 10px 0', fontSize: '0.8rem', color: '#dcfce7' }}>
                  El Nivel {level + 1} exigirá <b>{1 + (level + 1) * 2} tríos</b> y mayor velocidad
                </p>
                <button onClick={handleNextLevel} style={{ padding: '8px 16px', backgroundColor: '#0f172a', color: '#38bdf8', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  ▶ Comenzar Nivel {level + 1}
                </button>
              </div>
            ) : isGameOver ? (
              <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(220, 38, 38, 0.95)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '4px' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>¡GAME OVER!</h2>
                <p style={{ margin: '5px 0' }}>El núcleo se ha colapsado</p>
                <button onClick={handleReset} style={{ padding: '6px 14px', backgroundColor: '#fff', color: '#dc2626', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                  Reintentar
                </button>
              </div>
            ) : isPaused ? (
              <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(37, 99, 235, 0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '4px' }}>
                <h2 style={{ margin: 0 }}>PAUSADO</h2>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`, gap: '2px', width: '100%', height: '100%' }}>
                {grid.map((cellValue, index) => {
                  const r = Math.floor(index / GRID_SIZE);
                  const c = index % GRID_SIZE;
                  const isActive = activePiece && activePiece.row === r && activePiece.col === c;
                  const { isMainLane, isActiveLane } = getCellTrackStatus(r, c);

                  let cellColor = cellValue;
                  if (cellValue === 'CORE') cellColor = CORE_COLOR;
                  if (isActive) cellColor = activePiece.color;

                  let bgTileColor = '#0f172a';
                  if (isActiveLane) bgTileColor = '#1d4ed8';
                  else if (isMainLane) bgTileColor = '#1e293b';

                  const isCoreBlock = cellValue === 'CORE';

                  return (
                    <div
                      key={index}
                      style={{
                        backgroundColor: cellColor || bgTileColor,
                        borderRadius: '2px',
                        border: isCoreBlock ? '2px solid #94a3b8' : 'none',
                        boxShadow: isActive ? '0 0 8px #fff' : isCoreBlock ? 'inset 0 0 6px #000' : 'none',
                        transition: 'background-color 0.02s'
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Panel Ranking */}
        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #3b82f6', width: '160px', textAlign: 'left' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#f59e0b', textTransform: 'uppercase', textAlign: 'center' }}>🏆 TOP 5 RANKING</h3>
          <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ paddingBottom: '2px' }}>#</th>
                <th style={{ paddingBottom: '2px' }}>JUG</th>
                <th style={{ paddingBottom: '2px', textAlign: 'right' }}>PTS</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((item, idx) => (
                <tr key={idx} style={{ color: item.name === playerInitials ? '#38bdf8' : '#f8fafc', fontWeight: item.name === playerInitials ? 'bold' : 'normal' }}>
                  <td style={{ padding: '3px 0' }}>{idx + 1}.</td>
                  <td>{item.name}</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{item.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setHasEnteredName(false)} style={{ width: '100%', marginTop: '10px', padding: '5px', fontSize: '0.7rem', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cambiar Nombre
          </button>
        </div>

      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', margin: '4px 0 8px 0' }}>
        <button onClick={() => setIsPaused(!isPaused)} disabled={isGameOver || isLevelCleared} style={btnControlStyle}>
          {isPaused ? '▶ Reanudar' : '⏸ Pausar'}
        </button>
        <button onClick={handleReset} style={{ ...btnControlStyle, backgroundColor: '#dc2626' }}>
          🔄 Reiniciar
        </button>
      </div>

    </div>
  );
}

const btnCannonStyle = {
  padding: '4px 2px',
  fontSize: '0.6rem',
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const btnControlStyle = {
  padding: '6px 16px',
  fontSize: '0.85rem',
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
};