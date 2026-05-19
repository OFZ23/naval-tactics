import React from 'react';
import { Progress } from '@/components/ui/progress';
import { TOTAL_SHIP_CELLS, SHIP_DEFS } from '@/lib/gameConstants';
import { countHits, countSunkShips } from '@/lib/gameLogic';
import { cn } from '@/lib/utils';
import { Anchor, Target, Clock, Crosshair } from 'lucide-react';

export default function GameHUD({
  playerBoard,
  pcBoard,
  turn,
  turnCount,
  timeLeft,
  playerShots,
  playerHits,
  pcShots,
  pcHits,
}) {
  const pcDamage = countHits(pcBoard);
  const playerDamage = countHits(playerBoard);
  const pcProgress = Math.round((pcDamage / TOTAL_SHIP_CELLS) * 100);
  const playerLossProgress = Math.round((playerDamage / TOTAL_SHIP_CELLS) * 100);
  const totalShips = SHIP_DEFS.reduce((s, d) => s + d.count, 0);
  const pcSunk = countSunkShips(pcBoard);
  const playerSunk = countSunkShips(playerBoard);

  return (
    <div className="bg-card/40 border border-border/30 rounded-xl p-3 sm:p-4 space-y-3">
      {/* Turn indicator */}
      <div className="flex items-center justify-between">
        <div className={cn(
          'flex items-center gap-2 px-3 py-1 rounded-full text-xs font-heading font-bold tracking-wider transition-colors',
          turn === 'player' ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive',
        )}>
          {turn === 'player' ? <Crosshair className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
          {turn === 'player' ? 'TU TURNO' : 'TURNO PC'}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeLeft}s
          </span>
          <span className="font-heading font-bold">
            Turno #{turnCount}
          </span>
        </div>
      </div>

      {/* Fleet status */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-primary font-semibold flex items-center gap-1">
              <Anchor className="w-3 h-3" /> Flota enemiga
            </span>
            <span className="text-muted-foreground">{pcSunk}/{totalShips} hundidos</span>
          </div>
          <Progress value={pcProgress} className="h-2 bg-muted/30" />
          <p className="text-[10px] text-muted-foreground">{pcDamage}/{TOTAL_SHIP_CELLS} impactos</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-destructive font-semibold flex items-center gap-1">
              <Target className="w-3 h-3" /> Tu flota
            </span>
            <span className="text-muted-foreground">{playerSunk}/{totalShips} hundidos</span>
          </div>
          <Progress value={playerLossProgress} className="h-2 bg-muted/30" />
          <p className="text-[10px] text-muted-foreground">{playerDamage}/{TOTAL_SHIP_CELLS} daño recibido</p>
        </div>
      </div>
    </div>
  );
}