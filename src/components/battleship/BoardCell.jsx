import React from 'react';
import { CELL } from '@/lib/gameConstants';
import { getShipDef } from '@/lib/gameLogic';
import { cn } from '@/lib/utils';

const SHIP_COLORS = {
  carrier: 'bg-emerald-600/80 border-emerald-400',
  battleship: 'bg-blue-600/80 border-blue-400',
  submarine: 'bg-violet-600/80 border-violet-400',
  destroyer: 'bg-amber-600/80 border-amber-400',
};

function getShipColor(shipId) {
  const baseId = shipId?.split('_')[0];
  return SHIP_COLORS[baseId] || 'bg-cyan-700/60 border-cyan-500';
}

export default function BoardCell({
  cell,
  row,
  col,
  isPlayerBoard,
  isPreview,
  isInvalidPreview,
  onClick,
  onMouseEnter,
  onMouseLeave,
  disabled,
  isSetup,
}) {
  const { state, shipId } = cell;
  const shipDef = getShipDef(shipId);

  let content = '';
  let cellClass = 'bg-sky-900/30 border-sky-800/40 hover:bg-sky-700/40';

  if (state === CELL.HIT || state === CELL.SUNK) {
    content = '💥';
    cellClass = 'bg-red-900/60 border-red-600/60 animate-pulse';
    if (state === CELL.SUNK) {
      cellClass = 'bg-red-950/80 border-red-700/70';
    }
  } else if (state === CELL.MISS) {
    content = '🌊';
    cellClass = 'bg-blue-950/50 border-blue-800/40';
  } else if (state === CELL.SHIP && isPlayerBoard) {
    cellClass = `${getShipColor(shipId)} border-opacity-60`;
    content = shipDef?.emoji || '■';
  }

  if (isPreview) {
    cellClass = isInvalidPreview
      ? 'bg-red-500/40 border-red-400/60'
      : 'bg-cyan-400/30 border-cyan-300/50';
  }

  const isClickable = !disabled && (
    (isPlayerBoard && isSetup && state === CELL.EMPTY) ||
    (!isPlayerBoard && !isSetup && (state === CELL.EMPTY || state === CELL.SHIP))
  );

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled && !isClickable}
      aria-label={`Fila ${row + 1}, Columna ${String.fromCharCode(65 + col)}, ${
        state === CELL.HIT ? 'Impacto' :
        state === CELL.MISS ? 'Agua' :
        state === CELL.SUNK ? 'Hundido' :
        state === CELL.SHIP && isPlayerBoard ? `Barco ${shipDef?.name || ''}` :
        'Vacío'
      }`}
      className={cn(
        'w-full aspect-square border rounded-sm flex items-center justify-center',
        'text-xs sm:text-sm transition-all duration-150 select-none',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:z-10',
        cellClass,
        isClickable && 'cursor-crosshair hover:scale-110 hover:z-10',
        !isClickable && 'cursor-default',
      )}
    >
      {content}
    </button>
  );
}