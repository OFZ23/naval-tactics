import React from 'react';
import { SHIP_DEFS } from '@/lib/gameConstants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ShipSelector({
  selectedShip,
  onSelectShip,
  placedCounts,
  horizontal,
  onToggleOrientation,
  onAutoPlace,
  onClearBoard,
  allPlaced,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h4 className="font-heading text-sm font-semibold tracking-wider text-foreground/80 uppercase">
          Tus naves
        </h4>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleOrientation}
            className="text-xs gap-1 border-border/50"
          >
            <RotateCw className="w-3 h-3" />
            {horizontal ? 'Horizontal' : 'Vertical'}
          </Button>
          <Button size="sm" variant="outline" onClick={onAutoPlace} className="text-xs border-border/50">
            Auto
          </Button>
          <Button size="sm" variant="outline" onClick={onClearBoard} className="text-xs border-border/50">
            Limpiar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SHIP_DEFS.map(ship => {
          const placed = placedCounts[ship.id] || 0;
          const remaining = ship.count - placed;
          const exhausted = remaining <= 0;
          const isSelected = selectedShip?.id === ship.id;

          return (
            <button
              key={ship.id}
              onClick={() => !exhausted && onSelectShip(ship)}
              disabled={exhausted}
              className={cn(
                'relative rounded-lg border p-2.5 text-left transition-all',
                'hover:border-primary/50',
                isSelected && 'border-primary bg-primary/10 ring-2 ring-primary/30',
                !isSelected && !exhausted && 'border-border/40 bg-card/50',
                exhausted && 'opacity-40 cursor-not-allowed border-border/20 bg-muted/30',
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">{ship.emoji}</span>
                <span className="text-xs font-semibold text-foreground/90">{ship.name}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: ship.size }).map((_, i) => (
                    <div key={i} className={cn('w-3 h-3 rounded-sm', isSelected ? 'bg-primary' : 'bg-muted-foreground/30')} />
                  ))}
                </div>
                <Badge
                  variant={exhausted ? 'secondary' : 'default'}
                  className={cn('text-[10px] px-1.5 py-0', exhausted && 'bg-destructive/20 text-destructive')}
                >
                  {exhausted ? '✓' : remaining}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      {allPlaced && (
        <p className="text-center text-xs text-accent font-medium animate-pulse">
          ¡Todos los barcos colocados!
        </p>
      )}
    </div>
  );
}