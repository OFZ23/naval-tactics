import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PHASES, SHIP_DEFS, CELL, MESSAGES, TURN_TIME } from '@/lib/gameConstants';
import {
  createEmptyBoard, canPlaceShip, placeShip, fireAt, allShipsSunk,
  autoPlaceShips, getPreviewCells, getAIShot, getAccuracy, getShipDef,
} from '@/lib/gameLogic';
import { saveScore } from '@/lib/scoreManager';
import Board from '@/components/battleship/Board';
import ShipSelector from '@/components/battleship/ShipSelector';
import MessageLog from '@/components/battleship/MessageLog';
import GameHUD from '@/components/battleship/GameHUD';
import WelcomeScreen from '@/components/battleship/WelcomeScreen';
import GameOverModal from '@/components/battleship/GameOverModal';
import { Button } from '@/components/ui/button';
import { Anchor, Swords, RotateCcw } from 'lucide-react';

const TOTAL_SHIPS_TO_PLACE = SHIP_DEFS.reduce((s, d) => s + d.count, 0);

export default function BattleShip() {
  const [phase, setPhase] = useState(PHASES.WELCOME);
  const [difficulty, setDifficulty] = useState('normal');
  const [playerBoard, setPlayerBoard] = useState(() => createEmptyBoard());
  const [pcBoard, setPcBoard] = useState(() => createEmptyBoard());
  const [selectedShip, setSelectedShip] = useState(null);
  const [horizontal, setHorizontal] = useState(true);
  const [placedCounts, setPlacedCounts] = useState({});
  const [placedTotal, setPlacedTotal] = useState(0);
  const [previewCells, setPreviewCells] = useState([]);
  const [invalidPreview, setInvalidPreview] = useState(false);
  const [messages, setMessages] = useState([]);
  const [turn, setTurn] = useState('player');
  const [turnCount, setTurnCount] = useState(0);
  const [playerShots, setPlayerShots] = useState(0);
  const [playerHits, setPlayerHits] = useState(0);
  const [pcShots, setPcShots] = useState(0);
  const [pcHits, setPcHits] = useState(0);
  const [winner, setWinner] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TURN_TIME);
  const [aiMemory, setAiMemory] = useState({ hits: [] });
  const [pcTurnActive, setPcTurnActive] = useState(false);

  const timerRef = useRef(null);
  const pcBoardRef = useRef(pcBoard);
  const playerBoardRef = useRef(playerBoard);

  pcBoardRef.current = pcBoard;
  playerBoardRef.current = playerBoard;

  // Add message
  const addMsg = useCallback((text, type = 'info') => {
    setMessages(prev => [...prev.slice(-100), { text, type }]);
  }, []);

  // Start game from welcome
  const handleStart = useCallback((diff) => {
    setDifficulty(diff);
    setPhase(PHASES.SETUP);
    setPlayerBoard(createEmptyBoard());
    setPcBoard(autoPlaceShips(createEmptyBoard()));
    setSelectedShip(null);
    setHorizontal(true);
    setPlacedCounts({});
    setPlacedTotal(0);
    setMessages([{ text: MESSAGES.SETUP_HINT, type: 'system' }]);
    setTurn('player');
    setTurnCount(0);
    setPlayerShots(0);
    setPlayerHits(0);
    setPcShots(0);
    setPcHits(0);
    setWinner(null);
    setTimeLeft(TURN_TIME);
    setAiMemory({ hits: [] });
    setPcTurnActive(false);
  }, []);

  // Keyboard: R to rotate
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        if (phase === PHASES.SETUP) setHorizontal(h => !h);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase]);

  // Timer during PLAYING
  useEffect(() => {
    if (phase !== PHASES.PLAYING || turn !== 'player') return;
    setTimeLeft(TURN_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Auto fire random shot
          handleAutoFire();
          return TURN_TIME;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, turn, turnCount]);

  const handleAutoFire = useCallback(() => {
    const board = pcBoardRef.current;
    const candidates = [];
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const st = board[r][c].state;
        if (st === CELL.EMPTY || st === CELL.SHIP) candidates.push({ r, c });
      }
    }
    if (candidates.length > 0) {
      const shot = candidates[Math.floor(Math.random() * candidates.length)];
      addMsg(MESSAGES.TURN_TIMEOUT, 'error');
      handlePlayerShot(shot.r, shot.c);
    }
  }, []);

  // Place ship on player board
  const handlePlaceShip = useCallback((row, col) => {
    if (!selectedShip) {
      addMsg(MESSAGES.NO_SHIP_SELECTED, 'error');
      return;
    }
    const placed = placedCounts[selectedShip.id] || 0;
    if (placed >= selectedShip.count) {
      addMsg(MESSAGES.SHIP_EXHAUSTED, 'error');
      return;
    }
    if (!canPlaceShip(playerBoard, row, col, selectedShip.size, horizontal)) {
      const cells = getPreviewCells(row, col, selectedShip.size, horizontal);
      const oob = cells.length < selectedShip.size || cells.some(c => c.r >= 10 || c.c >= 10);
      addMsg(oob ? MESSAGES.OUT_OF_BOUNDS : MESSAGES.OVERLAP, 'error');
      return;
    }

    const shipId = `${selectedShip.id}_${placed}`;
    const newBoard = placeShip(playerBoard, row, col, selectedShip.size, horizontal, shipId);
    setPlayerBoard(newBoard);

    const newCounts = { ...placedCounts, [selectedShip.id]: placed + 1 };
    setPlacedCounts(newCounts);
    const newTotal = Object.values(newCounts).reduce((s, v) => s + v, 0);
    setPlacedTotal(newTotal);

    addMsg(`${selectedShip.emoji} ${selectedShip.name} colocado en ${String.fromCharCode(65 + col)}${row + 1}`, 'system');

    // Auto-deselect if exhausted
    if (placed + 1 >= selectedShip.count) {
      setSelectedShip(null);
    }

    if (newTotal >= TOTAL_SHIPS_TO_PLACE) {
      addMsg(MESSAGES.ALL_PLACED, 'system');
    }
  }, [selectedShip, placedCounts, playerBoard, horizontal, addMsg]);

  // Player preview hover
  const handlePlayerHover = useCallback((row, col) => {
    if (!selectedShip || phase !== PHASES.SETUP) {
      setPreviewCells([]);
      return;
    }
    const cells = getPreviewCells(row, col, selectedShip.size, horizontal);
    setPreviewCells(cells);
    setInvalidPreview(!canPlaceShip(playerBoard, row, col, selectedShip.size, horizontal));
  }, [selectedShip, horizontal, playerBoard, phase]);

  const handlePlayerLeave = useCallback(() => {
    setPreviewCells([]);
    setInvalidPreview(false);
  }, []);

  // Auto place
  const handleAutoPlace = useCallback(() => {
    const newBoard = autoPlaceShips(createEmptyBoard());
    setPlayerBoard(newBoard);
    const newCounts = {};
    SHIP_DEFS.forEach(s => { newCounts[s.id] = s.count; });
    setPlacedCounts(newCounts);
    setPlacedTotal(TOTAL_SHIPS_TO_PLACE);
    setSelectedShip(null);
    addMsg('Barcos colocados automáticamente.', 'system');
  }, [addMsg]);

  // Clear board
  const handleClearBoard = useCallback(() => {
    setPlayerBoard(createEmptyBoard());
    setPlacedCounts({});
    setPlacedTotal(0);
    addMsg('Tablero limpiado.', 'system');
  }, [addMsg]);

  // Start battle
  const handleStartBattle = useCallback(() => {
    setPhase(PHASES.PLAYING);
    setTurn('player');
    setTurnCount(1);
    addMsg('⚔️ ¡La batalla ha comenzado! Tu turno.', 'system');
  }, [addMsg]);

  // Player shot
  const handlePlayerShot = useCallback((row, col) => {
    if (phase !== PHASES.PLAYING || turn !== 'player' || pcTurnActive) return;

    const cell = pcBoardRef.current[row][col];
    if (cell.state === CELL.HIT || cell.state === CELL.MISS || cell.state === CELL.SUNK) {
      addMsg(MESSAGES.ALREADY_ATTACKED, 'error');
      return;
    }

    clearInterval(timerRef.current);

    const { board: newBoard, result, sunkShipId } = fireAt(pcBoardRef.current, row, col);
    setPcBoard(newBoard);
    pcBoardRef.current = newBoard;
    setPlayerShots(p => p + 1);

    const coordStr = `${String.fromCharCode(65 + col)}${row + 1}`;
    if (result === 'hit') {
      setPlayerHits(h => h + 1);
      addMsg(`${MESSAGES.HIT} en ${coordStr}`, 'hit');
    } else if (result === 'sunk') {
      setPlayerHits(h => h + 1);
      const def = getShipDef(sunkShipId);
      addMsg(`${MESSAGES.SUNK} ${def?.emoji || ''} ${def?.name || 'Barco'} hundido en ${coordStr}`, 'sunk');
    } else {
      addMsg(`${MESSAGES.MISS} en ${coordStr}`, 'miss');
    }

    // Check winner after board update
    if (allShipsSunk(newBoard)) {
      setWinner('player');
      setPhase(PHASES.GAME_OVER);
      addMsg(MESSAGES.PLAYER_WINS, 'system');
      saveScore({
        difficulty,
        turns: turnCount,
        accuracy: getAccuracy(playerShots + 1, playerHits + (result !== 'miss' ? 1 : 0)),
        won: true,
      });
      return;
    }

    // Switch to PC turn
    setTurn('pc');
    setPcTurnActive(true);
    addMsg(MESSAGES.PC_TURN, 'info');
  }, [phase, turn, pcTurnActive, addMsg, turnCount, difficulty, playerShots, playerHits]);

  // PC turn effect
  useEffect(() => {
    if (!pcTurnActive || phase !== PHASES.PLAYING) return;

    const timeout = setTimeout(() => {
      executePcTurn();
    }, 800 + Math.random() * 600);

    return () => clearTimeout(timeout);
  }, [pcTurnActive, phase]);

  const executePcTurn = useCallback(() => {
    const board = playerBoardRef.current;
    const shot = getAIShot(board, difficulty, aiMemory);
    if (!shot) {
      setPcTurnActive(false);
      setTurn('player');
      setTurnCount(t => t + 1);
      return;
    }

    const { board: newBoard, result, sunkShipId } = fireAt(board, shot.r, shot.c);
    setPlayerBoard(newBoard);
    playerBoardRef.current = newBoard;
    setPcShots(p => p + 1);

    const coordStr = `${String.fromCharCode(65 + shot.c)}${shot.r + 1}`;
    if (result === 'hit') {
      setPcHits(h => h + 1);
      addMsg(`PC: ${MESSAGES.HIT} en ${coordStr}`, 'hit');
      // Add to AI memory
      setAiMemory(prev => ({ ...prev, hits: [...prev.hits, { r: shot.r, c: shot.c }] }));
    } else if (result === 'sunk') {
      setPcHits(h => h + 1);
      const def = getShipDef(sunkShipId);
      addMsg(`PC: ${MESSAGES.SUNK} ${def?.emoji || ''} ${def?.name || 'Barco'}`, 'sunk');
      // Remove sunk ship cells from AI memory
      setAiMemory(prev => {
        const sunkCells = new Set();
        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 10; c++) {
            if (newBoard[r][c].shipId === sunkShipId) sunkCells.add(`${r},${c}`);
          }
        }
        return { ...prev, hits: prev.hits.filter(h => !sunkCells.has(`${h.r},${h.c}`)) };
      });
    } else {
      addMsg(`PC: ${MESSAGES.MISS} en ${coordStr}`, 'miss');
    }

    // Check if PC wins
    if (allShipsSunk(newBoard)) {
      setWinner('pc');
      setPhase(PHASES.GAME_OVER);
      addMsg(MESSAGES.PC_WINS, 'system');
      setPcTurnActive(false);
      return;
    }

    // End PC turn — no recursion on hit to avoid multiple shots
    setPcTurnActive(false);
    setTurn('player');
    setTurnCount(t => t + 1);
  }, [difficulty, aiMemory, addMsg]);

  // Restart same difficulty
  const handleRestart = useCallback(() => {
    handleStart(difficulty);
  }, [difficulty, handleStart]);

  // Back to home
  const handleHome = useCallback(() => {
    setPhase(PHASES.WELCOME);
  }, []);

  // Welcome screen
  if (phase === PHASES.WELCOME) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  const allPlaced = placedTotal >= TOTAL_SHIPS_TO_PLACE;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 font-body">
      {/* Header */}
      <header className="border-b border-border/30 bg-card/30 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Anchor className="w-5 h-5 text-primary" />
            <span className="font-heading text-sm sm:text-lg font-bold tracking-wider text-foreground">
              BATALLA NAVAL
            </span>
          </div>
          <div className="flex items-center gap-2">
            {phase === PHASES.PLAYING && (
              <Button size="sm" variant="outline" onClick={handleRestart} className="text-xs gap-1 border-border/40">
                <RotateCcw className="w-3 h-3" /> Reiniciar
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={handleHome} className="text-xs">
              Inicio
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 py-4 space-y-4">
        {/* HUD — only in PLAYING */}
        {phase === PHASES.PLAYING && (
          <GameHUD
            playerBoard={playerBoard}
            pcBoard={pcBoard}
            turn={turn}
            turnCount={turnCount}
            timeLeft={timeLeft}
            playerShots={playerShots}
            playerHits={playerHits}
            pcShots={pcShots}
            pcHits={pcHits}
          />
        )}

        {/* Boards */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-4 lg:gap-8">
          <Board
            board={playerBoard}
            title="Tu flota"
            isPlayerBoard
            previewCells={phase === PHASES.SETUP ? previewCells : []}
            invalidPreview={invalidPreview}
            onCellClick={phase === PHASES.SETUP ? handlePlaceShip : undefined}
            onCellHover={phase === PHASES.SETUP ? handlePlayerHover : undefined}
            onCellLeave={phase === PHASES.SETUP ? handlePlayerLeave : undefined}
            disabled={phase !== PHASES.SETUP}
            isSetup={phase === PHASES.SETUP}
          />
          <Board
            board={pcBoard}
            title="Tablero enemigo"
            isPlayerBoard={false}
            onCellClick={phase === PHASES.PLAYING && turn === 'player' && !pcTurnActive ? handlePlayerShot : undefined}
            disabled={phase !== PHASES.PLAYING || turn !== 'player' || pcTurnActive}
            isSetup={false}
          />
        </div>

        {/* Setup controls */}
        {phase === PHASES.SETUP && (
          <div className="max-w-2xl mx-auto space-y-3">
            <ShipSelector
              selectedShip={selectedShip}
              onSelectShip={setSelectedShip}
              placedCounts={placedCounts}
              horizontal={horizontal}
              onToggleOrientation={() => setHorizontal(h => !h)}
              onAutoPlace={handleAutoPlace}
              onClearBoard={handleClearBoard}
              allPlaced={allPlaced}
            />
            <Button
              className="w-full font-heading tracking-wider h-12 bg-primary hover:bg-primary/90"
              disabled={!allPlaced}
              onClick={handleStartBattle}
            >
              <Swords className="w-4 h-4 mr-2" />
              {allPlaced ? 'INICIAR BATALLA' : `Coloca todos tus barcos (${placedTotal}/${TOTAL_SHIPS_TO_PLACE})`}
            </Button>
          </div>
        )}

        {/* Message log */}
        <div className="max-w-2xl mx-auto">
          <MessageLog messages={messages} />
        </div>
      </main>

      {/* Game Over Modal */}
      <GameOverModal
        open={phase === PHASES.GAME_OVER}
        winner={winner}
        turnCount={turnCount}
        playerShots={playerShots}
        playerHits={playerHits}
        pcShots={pcShots}
        pcHits={pcHits}
        onRestart={handleRestart}
        onHome={handleHome}
      />
    </div>
  );
}