import { BOARD_SIZE, CELL, SHIP_DEFS, TOTAL_SHIP_CELLS, DIFFICULTY } from './gameConstants';

// Create empty board
export function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({ state: CELL.EMPTY, shipId: null }))
  );
}

// Check if placement is valid
export function canPlaceShip(board, row, col, size, horizontal) {
  for (let i = 0; i < size; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    if (r >= BOARD_SIZE || c >= BOARD_SIZE) return false;
    if (board[r][c].state !== CELL.EMPTY) return false;
  }
  return true;
}

// Place a ship on the board
export function placeShip(board, row, col, size, horizontal, shipId) {
  const newBoard = board.map(r => r.map(c => ({ ...c })));
  for (let i = 0; i < size; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    newBoard[r][c] = { state: CELL.SHIP, shipId };
  }
  return newBoard;
}

// Get cells belonging to a ship
export function getShipCells(board, shipId) {
  const cells = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c].shipId === shipId) cells.push({ r, c });
    }
  }
  return cells;
}

// Check if ship is sunk
export function isShipSunk(board, shipId) {
  const cells = getShipCells(board, shipId);
  return cells.length > 0 && cells.every(({ r, c }) => board[r][c].state === CELL.HIT || board[r][c].state === CELL.SUNK);
}

// Mark sunk ship cells
export function markSunk(board, shipId) {
  const newBoard = board.map(r => r.map(c => ({ ...c })));
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (newBoard[r][c].shipId === shipId) {
        newBoard[r][c].state = CELL.SUNK;
      }
    }
  }
  return newBoard;
}

// Fire at a cell, returns { board, result: 'hit'|'miss'|'sunk', sunkShipId? }
export function fireAt(board, row, col) {
  const newBoard = board.map(r => r.map(c => ({ ...c })));
  const cell = newBoard[row][col];

  if (cell.state === CELL.HIT || cell.state === CELL.MISS || cell.state === CELL.SUNK) {
    return { board: newBoard, result: 'already' };
  }

  if (cell.state === CELL.SHIP) {
    newBoard[row][col] = { ...cell, state: CELL.HIT };
    if (isShipSunk(newBoard, cell.shipId)) {
      const finalBoard = markSunk(newBoard, cell.shipId);
      return { board: finalBoard, result: 'sunk', sunkShipId: cell.shipId };
    }
    return { board: newBoard, result: 'hit' };
  }

  newBoard[row][col] = { ...cell, state: CELL.MISS };
  return { board: newBoard, result: 'miss' };
}

// Count hits
export function countHits(board) {
  let hits = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c].state === CELL.HIT || board[r][c].state === CELL.SUNK) hits++;
    }
  }
  return hits;
}

// Check if all ships sunk
export function allShipsSunk(board) {
  return countHits(board) >= TOTAL_SHIP_CELLS;
}

// Random placement for PC or auto-place
export function autoPlaceShips(board) {
  let newBoard = board.map(r => r.map(c => ({ ...c })));
  for (const def of SHIP_DEFS) {
    for (let n = 0; n < def.count; n++) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 500) {
        const horizontal = Math.random() > 0.5;
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        if (canPlaceShip(newBoard, row, col, def.size, horizontal)) {
          newBoard = placeShip(newBoard, row, col, def.size, horizontal, `${def.id}_${n}`);
          placed = true;
        }
        attempts++;
      }
    }
  }
  return newBoard;
}

// Count remaining ship cells (not yet hit)
export function countRemainingShipCells(board) {
  let remaining = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c].state === CELL.SHIP) remaining++;
    }
  }
  return remaining;
}

// Get sunk ship IDs
export function getSunkShipIds(board) {
  const ids = new Set();
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c].state === CELL.SUNK && board[r][c].shipId) {
        ids.add(board[r][c].shipId);
      }
    }
  }
  return ids;
}

// Count sunk ships
export function countSunkShips(board) {
  return getSunkShipIds(board).size;
}

// AI logic
export function getAIShot(board, difficulty, aiMemory) {
  if (difficulty === DIFFICULTY.EASY) {
    return getRandomShot(board);
  }

  // Normal & Hard: hunt/target mode
  const { hits } = aiMemory;

  if (hits.length > 0) {
    // Target mode
    if (difficulty === DIFFICULTY.HARD && hits.length >= 2) {
      // Try to detect direction
      const sorted = [...hits].sort((a, b) => a.r === b.r ? a.c - b.c : a.r - b.r);
      const isHorizontal = sorted.every(h => h.r === sorted[0].r);
      const isVertical = sorted.every(h => h.c === sorted[0].c);

      if (isHorizontal) {
        const minC = Math.min(...sorted.map(h => h.c));
        const maxC = Math.max(...sorted.map(h => h.c));
        const r = sorted[0].r;
        // Try extending in direction
        const candidates = [];
        if (maxC + 1 < BOARD_SIZE && isValidTarget(board, r, maxC + 1)) candidates.push({ r, c: maxC + 1 });
        if (minC - 1 >= 0 && isValidTarget(board, r, minC - 1)) candidates.push({ r, c: minC - 1 });
        if (candidates.length > 0) return candidates[Math.floor(Math.random() * candidates.length)];
      }

      if (isVertical) {
        const minR = Math.min(...sorted.map(h => h.r));
        const maxR = Math.max(...sorted.map(h => h.r));
        const c = sorted[0].c;
        const candidates = [];
        if (maxR + 1 < BOARD_SIZE && isValidTarget(board, maxR + 1, c)) candidates.push({ r: maxR + 1, c });
        if (minR - 1 >= 0 && isValidTarget(board, minR - 1, c)) candidates.push({ r: minR - 1, c });
        if (candidates.length > 0) return candidates[Math.floor(Math.random() * candidates.length)];
      }
    }

    // Normal: shoot adjacent to any hit
    const adjacentCandidates = [];
    for (const hit of hits) {
      const neighbors = [
        { r: hit.r - 1, c: hit.c },
        { r: hit.r + 1, c: hit.c },
        { r: hit.r, c: hit.c - 1 },
        { r: hit.r, c: hit.c + 1 },
      ];
      for (const n of neighbors) {
        if (n.r >= 0 && n.r < BOARD_SIZE && n.c >= 0 && n.c < BOARD_SIZE && isValidTarget(board, n.r, n.c)) {
          adjacentCandidates.push(n);
        }
      }
    }
    if (adjacentCandidates.length > 0) {
      return adjacentCandidates[Math.floor(Math.random() * adjacentCandidates.length)];
    }
  }

  // Hunt mode: random
  return getRandomShot(board);
}

function isValidTarget(board, r, c) {
  const state = board[r][c].state;
  return state === CELL.EMPTY || state === CELL.SHIP;
}

function getRandomShot(board) {
  const candidates = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isValidTarget(board, r, c)) candidates.push({ r, c });
    }
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// Get preview cells for ship placement
export function getPreviewCells(row, col, size, horizontal) {
  const cells = [];
  for (let i = 0; i < size; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    if (r < BOARD_SIZE && c < BOARD_SIZE) cells.push({ r, c });
  }
  return cells;
}

// Accuracy percentage
export function getAccuracy(shots, hits) {
  if (shots === 0) return 0;
  return Math.round((hits / shots) * 100);
}

// Ship info from shipId
export function getShipDef(shipId) {
  const baseId = shipId?.split('_')[0];
  return SHIP_DEFS.find(s => s.id === baseId);
}