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
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          color: '#fff',
          minHeight: 'calc(100vh - 110px)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Orbitron', monospace",
            color: '#00f3ff',
            fontSize: '2.4rem',
            letterSpacing: '5px',
            marginBottom: '8px',
            textShadow: '0 0 16px rgba(0, 243, 255, 0.7)',
          }}
        >
          TETRACORE
        </h1>
        <p
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            color: '#94a3b8',
            fontSize: '1.05rem',
            letterSpacing: '1px',
            marginBottom: '24px',
          }}
        >
          IDENTIFICACIÓN DE PILOTO PARA EL RANKING ARCADE
        </p>

        <form
          onSubmit={handleNameSubmit}
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '28px 24px',
            borderRadius: '16px',
            border: '1px solid rgba(0, 243, 255, 0.4)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65), inset 0 0 14px rgba(0, 243, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            width: '300px',
          }}
        >
          <label
            style={{
              fontFamily: "'Orbitron', monospace",
              fontWeight: '700',
              fontSize: '0.75rem',
              letterSpacing: '1.5px',
              color: '#cbd5e1',
            }}
          >
            INICIALES (3 LETRAS)
          </label>
          <input
            type="text"
            maxLength={3}
            value={playerInitials}
            onChange={(e) => setPlayerInitials(e.target.value.toUpperCase())}
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '2rem',
              textAlign: 'center',
              fontWeight: '900',
              letterSpacing: '8px',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid rgba(0, 243, 255, 0.65)',
              background: 'rgba(8, 8, 17, 0.85)',
              color: '#00f3ff',
              boxShadow: 'inset 0 0 10px rgba(0, 243, 255, 0.2)',
              outline: 'none',
            }}
            required
          />
          <button
            type="submit"
            style={{
              ...btnCannonStyle,
              padding: '12px',
              fontSize: '0.9rem',
              marginTop: '4px',
            }}
          >
            INICIAR MISIÓN ▶
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '6px 12px',
        textAlign: 'center',
        color: '#fff',
        minHeight: 'calc(100vh - 110px)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* Título y HUD Superior Estilo Cyberpunk */}
      <div>
        <h2
          style={{
            margin: '2px 0',
            fontFamily: "'Orbitron', monospace",
            color: '#00f3ff',
            fontSize: '1.25rem',
            letterSpacing: '2px',
            textShadow: '0 0 10px rgba(0, 243, 255, 0.6)',
          }}
        >
          TETRACORE <span style={{ color: '#ff0055', fontSize: '0.9rem' }}>// ARENA 7x7</span>
        </h2>

        <div
          style={{
            margin: '4px 0 6px 0',
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '1rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.55)',
            padding: '4px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(0, 243, 255, 0.25)',
          }}
        >
          <span>PILOTO: <b style={{ color: '#00f3ff', fontFamily: "'Orbitron', monospace" }}>{playerInitials}</b></span>
          <span>|</span>
          <span>SCORE: <b style={{ color: '#00ff66', fontFamily: "'Orbitron', monospace" }}>{score}</b></span>
          <span>|</span>
          <span>NIVEL: <b style={{ color: '#fbbf24', fontFamily: "'Orbitron', monospace" }}>{level}</b></span>
          <span>|</span>
          <span>OBJETIVO: <b style={{ color: '#ec4899', fontFamily: "'Orbitron', monospace" }}>{combosInLevel}/{targetCombos} TRÍOS</b></span>
        </div>
      </div>

      {/* Área Central: Tablero + Cañones a la izquierda | Ranking TOP 5 a la derecha */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', alignItems: 'center', position: 'relative' }}>
        
        {/* Arena de Juego con los 4 Cañones Retro Simétricos */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative' }}>
          
          {/* Cañón Superior */}
          <button
            onClick={() => !activePiece && spawnPiece('TOP')}
            disabled={!!activePiece || isPaused || isGameOver || isLevelCleared}
            title="Disparar desde arriba"
            style={{
              ...btnCannonStyle,
              width: '68px',
              height: '32px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px 12px 4px 4px',
              borderBottom: '2px solid #00f3ff',
              fontSize: '0.95rem',
              opacity: activePiece ? 0.4 : 1,
            }}
          >
            ▲
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Cañón Izquierdo */}
            <button
              onClick={() => !activePiece && spawnPiece('LEFT')}
              disabled={!!activePiece || isPaused || isGameOver || isLevelCleared}
              title="Disparar desde la izquierda"
              style={{
                ...btnCannonStyle,
                width: '32px',
                height: '68px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px 4px 4px 12px',
                borderRight: '2px solid #00f3ff',
                fontSize: '0.95rem',
                opacity: activePiece ? 0.4 : 1,
              }}
            >
              ◀
            </button>

            {/* Cuadrícula 7x7 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 36px)',
                gridTemplateRows: 'repeat(7, 36px)',
                gap: '4px',
                padding: '8px',
                background: 'rgba(10, 15, 30, 0.8)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                borderRadius: '12px',
                border: '1px solid rgba(0, 243, 255, 0.35)',
                boxShadow: '0 0 24px rgba(0, 243, 255, 0.15), inset 0 0 14px rgba(0, 0, 0, 0.8)',
                position: 'relative',
              }}
            >
              {grid.map((cellColor, idx) => {
                const r = Math.floor(idx / GRID_SIZE);
                const c = idx % GRID_SIZE;
                const isCore = idx === CORE_INDEX;
                const isPiece = activePiece && activePiece.row === r && activePiece.col === c;
                const { isMainLane, isActiveLane } = getCellTrackStatus(r, c);

                let bg = 'rgba(15, 23, 42, 0.45)';
                let border = '1px solid rgba(255, 255, 255, 0.05)';
                let shadow = 'none';

                if (isCore) {
                  bg = 'radial-gradient(circle, #00f3ff 20%, #0f172a 85%)';
                  border = '1px solid #00f3ff';
                  shadow = '0 0 12px rgba(0, 243, 255, 0.7)';
                } else if (isPiece) {
                  bg = activePiece.color;
                  border = '1px solid #ffffff';
                  shadow = `0 0 14px ${activePiece.color}`;
                } else if (cellColor && cellColor !== 'CORE') {
                  bg = cellColor;
                  border = '1px solid rgba(255, 255, 255, 0.4)';
                  shadow = `0 0 8px ${cellColor}88`;
                } else if (isActiveLane) {
                  bg = 'rgba(0, 243, 255, 0.18)';
                  border = '1px dashed rgba(0, 243, 255, 0.45)';
                } else if (isMainLane) {
                  bg = 'rgba(255, 255, 255, 0.04)';
                  border = '1px solid rgba(255, 255, 255, 0.1)';
                }

                return (
                  <div
                    key={idx}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: isCore ? '8px' : '5px',
                      backgroundColor: isPiece ? activePiece.color : cellColor && cellColor !== 'CORE' ? cellColor : undefined,
                      background: isCore ? bg : undefined,
                      border,
                      boxShadow: shadow,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      transition: 'background-color 0.1s ease',
                    }}
                  >
                    {isCore && '✦'}
                  </div>
                );
              })}

              {/* Cartel Flotante: GAME OVER */}
              {isGameOver && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(8, 8, 17, 0.88)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '12px',
                    padding: '16px',
                    zIndex: 20,
                  }}
                >
                  <h3 style={{ color: '#ff0055', fontFamily: "'Orbitron', monospace", fontSize: '1.2rem', marginBottom: '8px' }}>
                    NÚCLEO SATURADO
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '14px' }}>
                    Puntaje final: <b style={{ color: '#00ff66' }}>{score}</b>
                  </p>
                  <button onClick={handleReset} style={btnControlStyle}>
                    REINTENTAR
                  </button>
                </div>
              )}

              {/* Cartel Flotante: NIVEL COMPLETADO */}
              {isLevelCleared && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(8, 8, 17, 0.88)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '12px',
                    padding: '16px',
                    zIndex: 20,
                  }}
                >
                  <h3 style={{ color: '#00ff66', fontFamily: "'Orbitron', monospace", fontSize: '1.1rem', marginBottom: '6px' }}>
                    SECTOR PURGADO
                  </h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '14px' }}>
                    Bono de Nivel: +{500 * level} pts
                  </p>
                  <button onClick={handleNextLevel} style={btnControlStyle}>
                    SIGUIENTE NIVEL ▶
                  </button>
                </div>
              )}
            </div>

            {/* Cañón Derecho */}
            <button
              onClick={() => !activePiece && spawnPiece('RIGHT')}
              disabled={!!activePiece || isPaused || isGameOver || isLevelCleared}
              title="Disparar desde la derecha"
              style={{
                ...btnCannonStyle,
                width: '32px',
                height: '68px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px 12px 12px 4px',
                borderLeft: '2px solid #00f3ff',
                fontSize: '0.95rem',
                opacity: activePiece ? 0.4 : 1,
              }}
            >
              ▶
            </button>
          </div>

          {/* Cañón Inferior */}
          <button
            onClick={() => !activePiece && spawnPiece('BOTTOM')}
            disabled={!!activePiece || isPaused || isGameOver || isLevelCleared}
            title="Disparar desde abajo"
            style={{
              ...btnCannonStyle,
              width: '68px',
              height: '32px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px 4px 12px 12px',
              borderTop: '2px solid #00f3ff',
              fontSize: '0.95rem',
              opacity: activePiece ? 0.4 : 1,
            }}
          >
            ▼
          </button>
        </div>

        {/* Panel Glassmorphic: Ranking TOP 5 */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '14px',
            borderRadius: '14px',
            border: '1px solid rgba(0, 243, 255, 0.35)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 12px rgba(0, 243, 255, 0.1)',
            width: '160px',
            textAlign: 'left',
          }}
        >
          <h3
            style={{
              margin: '0 0 10px 0',
              fontFamily: "'Orbitron', monospace",
              fontSize: '0.75rem',
              color: '#fbbf24',
              textTransform: 'uppercase',
              textAlign: 'center',
              letterSpacing: '1.2px',
              textShadow: '0 0 10px rgba(251, 191, 36, 0.5)',
            }}
          >
            🏆 TOP 5 PILOTOS
          </h3>
          <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse', fontFamily: "'Rajdhani', sans-serif" }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0, 243, 255, 0.25)', color: 'rgba(255, 255, 255, 0.65)' }}>
                <th style={{ paddingBottom: '4px', textAlign: 'left' }}>#</th>
                <th style={{ paddingBottom: '4px', textAlign: 'left' }}>TAG</th>
                <th style={{ paddingBottom: '4px', textAlign: 'right' }}>PTS</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((item, idx) => {
                const isCurrent = item.name === playerInitials;
                return (
                  <tr
                    key={idx}
                    style={{
                      color: isCurrent ? '#00f3ff' : '#e2e8f0',
                      fontWeight: isCurrent ? '700' : '500',
                      textShadow: isCurrent ? '0 0 8px rgba(0, 243, 255, 0.6)' : 'none',
                    }}
                  >
                    <td style={{ padding: '4px 0' }}>{idx + 1}.</td>
                    <td>{item.name}</td>
                    <td style={{ textAlign: 'right', color: '#00ff66', fontWeight: '700' }}>{item.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Controles de Partida Inferiores */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', margin: '6px 0' }}>
        <button onClick={() => setIsPaused(!isPaused)} disabled={isGameOver || isLevelCleared} style={btnControlStyle}>
          {isPaused ? '▶ Reanudar' : '⏸ Pausar'}
        </button>
        <button
          onClick={handleReset}
          style={{
            ...btnControlStyle,
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.35) 0%, rgba(185, 28, 28, 0.6) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.7)',
            boxShadow: '0 0 14px rgba(239, 68, 68, 0.4), inset 0 0 8px rgba(239, 68, 68, 0.25)',
          }}
        >
          🔄 Reiniciar
        </button>
      </div>

    </div>
  );
}

const btnCannonStyle = {
  fontFamily: "'Orbitron', monospace",
  padding: '8px 14px',
  fontSize: '0.85rem',
  color: '#ffffff',
  background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.25) 0%, rgba(157, 0, 255, 0.35) 100%)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(0, 243, 255, 0.6)',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '700',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  boxShadow: '0 0 14px rgba(0, 243, 255, 0.35), inset 0 0 6px rgba(0, 243, 255, 0.2)',
};

const btnControlStyle = {
  fontFamily: "'Orbitron', monospace",
  padding: '8px 18px',
  fontSize: '0.85rem',
  color: '#ffffff',
  background: 'linear-gradient(135deg, rgba(255, 0, 85, 0.25) 0%, rgba(157, 0, 255, 0.35) 100%)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 0, 85, 0.6)',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '700',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  boxShadow: '0 0 14px rgba(255, 0, 85, 0.35), inset 0 0 6px rgba(255, 0, 85, 0.2)',
};