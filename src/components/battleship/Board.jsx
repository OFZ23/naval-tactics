import React from 'react';
import { BOARD_SIZE, COLS } from '@/lib/gameConstants';
import BoardCell from './BoardCell';

export default function Board({
  board,
  title,
  isPlayerBoard,
  previewCells,
  invalidPreview,
  onCellClick,
  onCellHover,
  onCellLeave,
  disabled,
  isSetup,
}) {
  const previewSet = new Set((previewCells || []).map(c => `${c.r},${c.c}`));

  return (
    <div className="w-full max-w-[400px]">
      <h3 className="text-center font-heading text-sm sm:text-base font-semibold text-foreground/80 mb-2 tracking-wider uppercase">
        {title}
      </h3>
      <div className="grid gap-0" style={{ gridTemplateColumns: `28px repeat(${BOARD_SIZE}, 1fr)` }}>
        {/* Corner */}
        <div />
        {/* Column headers */}
        {COLS.map(c => (
          <div key={c} className="flex items-center justify-center text-[10px] sm:text-xs font-heading text-muted-foreground font-bold py-1">
            {c}
          </div>
        ))}

        {/* Rows */}
        {board.map((row, ri) => (
          <React.Fragment key={ri}>
            {/* Row label */}
            <div className="flex items-center justify-center text-[10px] sm:text-xs font-heading text-muted-foreground font-bold pr-1">
              {ri + 1}
            </div>
            {row.map((cell, ci) => (
              <BoardCell
                key={`${ri}-${ci}`}
                cell={cell}
                row={ri}
                col={ci}
                isPlayerBoard={isPlayerBoard}
                isPreview={previewSet.has(`${ri},${ci}`)}
                isInvalidPreview={invalidPreview && previewSet.has(`${ri},${ci}`)}
                onClick={() => onCellClick?.(ri, ci)}
                onMouseEnter={() => onCellHover?.(ri, ci)}
                onMouseLeave={() => onCellLeave?.()}
                disabled={disabled}
                isSetup={isSetup}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}