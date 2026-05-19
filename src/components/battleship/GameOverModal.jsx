import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy, Skull, RotateCcw, Home } from 'lucide-react';
import { getAccuracy } from '@/lib/gameLogic';

export default function GameOverModal({
  open,
  winner,
  turnCount,
  playerShots,
  playerHits,
  pcShots,
  pcHits,
  onRestart,
  onHome,
}) {
  const playerWon = winner === 'player';
  const playerAcc = getAccuracy(playerShots, playerHits);
  const pcAcc = getAccuracy(pcShots, pcHits);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-card border-border/50" hideClose>
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-3 text-center">
            {playerWon ? (
              <Trophy className="w-14 h-14 text-amber-400" />
            ) : (
              <Skull className="w-14 h-14 text-destructive" />
            )}
            <span className="font-heading text-2xl tracking-wider">
              {playerWon ? '¡VICTORIA!' : 'DERROTA'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-center text-sm text-muted-foreground">
            {playerWon
              ? '¡Has hundido toda la flota enemiga!'
              : 'La PC ha hundido toda tu flota...'}
          </p>

          {/* Stats */}
          <div className="bg-muted/20 border border-border/30 rounded-lg p-4 space-y-3">
            <h4 className="font-heading text-xs uppercase tracking-widest text-muted-foreground text-center">
              Estadísticas
            </h4>
            <div className="grid grid-cols-2 gap-4 text-center text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Turnos totales</p>
                <p className="font-heading text-xl font-bold text-foreground">{turnCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Tu precisión</p>
                <p className="font-heading text-xl font-bold text-primary">{playerAcc}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Tus disparos</p>
                <p className="font-heading text-lg font-bold text-foreground">
                  {playerHits}/{playerShots}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Precisión PC</p>
                <p className="font-heading text-lg font-bold text-destructive">{pcAcc}%</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={onHome} variant="outline" className="flex-1 gap-1">
              <Home className="w-4 h-4" /> Inicio
            </Button>
            <Button onClick={onRestart} className="flex-1 gap-1 bg-primary hover:bg-primary/90">
              <RotateCcw className="w-4 h-4" /> Revancha
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}