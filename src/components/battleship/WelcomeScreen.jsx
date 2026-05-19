import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DIFFICULTY, MESSAGES } from '@/lib/gameConstants';
import { getTopScores } from '@/lib/scoreManager';
import { Anchor, Swords, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const DIFF_OPTIONS = [
  { key: DIFFICULTY.EASY, label: 'Fácil', desc: 'Disparos aleatorios', color: 'text-green-400' },
  { key: DIFFICULTY.NORMAL, label: 'Normal', desc: 'IA busca adyacentes', color: 'text-amber-400' },
  { key: DIFFICULTY.HARD, label: 'Difícil', desc: 'IA detecta dirección', color: 'text-red-400' },
];

export default function WelcomeScreen({ onStart }) {
  const [difficulty, setDifficulty] = useState(DIFFICULTY.NORMAL);
  const scores = getTopScores();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background via-background to-secondary/20">
      <div className="max-w-lg w-full space-y-8 text-center">
        {/* Title */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Anchor className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            <h1 className="font-heading text-3xl sm:text-5xl font-black text-foreground tracking-tight">
              BATALLA
              <span className="text-primary"> NAVAL</span>
            </h1>
            <Anchor className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {MESSAGES.WELCOME_SUB}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-card/50 border border-border/30 rounded-xl p-4 text-left space-y-2">
          <h3 className="font-heading text-xs font-bold text-foreground/70 uppercase tracking-widest flex items-center gap-2">
            <Swords className="w-3.5 h-3.5" /> Cómo jugar
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>1. Coloca tus barcos en el tablero izquierdo haciendo clic en las celdas.</li>
            <li>2. Presiona <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">R</kbd> para rotar un barco antes de colocarlo.</li>
            <li>3. Dispara a la flota enemiga haciendo clic en el tablero derecho.</li>
            <li>4. Hunde todos los barcos enemigos antes de que hundan los tuyos.</li>
            <li>5. Tienes 15 segundos por turno o se disparará automáticamente.</li>
          </ul>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <h3 className="font-heading text-xs font-bold text-foreground/70 uppercase tracking-widest">
            Dificultad
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {DIFF_OPTIONS.map(d => (
              <button
                key={d.key}
                onClick={() => setDifficulty(d.key)}
                className={cn(
                  'border rounded-lg p-3 transition-all text-center',
                  difficulty === d.key
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                    : 'border-border/40 bg-card/30 hover:border-border/60',
                )}
              >
                <p className={cn('font-heading text-sm font-bold', d.color)}>{d.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <Button
          size="lg"
          onClick={() => onStart(difficulty)}
          className="w-full font-heading text-lg tracking-wider h-14 bg-primary hover:bg-primary/90"
        >
          ⚓ NUEVA PARTIDA
        </Button>

        {/* Scores */}
        {scores.length > 0 && (
          <div className="bg-card/30 border border-border/20 rounded-xl p-3 text-left">
            <h3 className="font-heading text-xs font-bold text-foreground/60 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Mejores partidas
            </h3>
            <div className="space-y-1">
              {scores.slice(0, 5).map((s, i) => (
                <div key={i} className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    <span className="text-amber-400 font-bold mr-1">#{i + 1}</span>
                    {s.difficulty?.toUpperCase()} — {s.turns} turnos — {s.accuracy}% precisión
                  </span>
                  <span className="text-[10px]">{new Date(s.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}