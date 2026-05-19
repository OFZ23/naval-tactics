export const BOARD_SIZE = 10;
export const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export const PHASES = {
  WELCOME: 'WELCOME',
  SETUP: 'SETUP',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER',
};

export const CELL = {
  EMPTY: 'empty',
  SHIP: 'ship',
  HIT: 'hit',
  MISS: 'miss',
  SUNK: 'sunk',
};

export const DIFFICULTY = {
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard',
};

export const SHIP_DEFS = [
  { id: 'carrier', name: 'Portaviones', size: 5, count: 1, color: 'bg-emerald-600', emoji: '🚢' },
  { id: 'battleship', name: 'Acorazado', size: 4, count: 1, color: 'bg-blue-500', emoji: '⚓' },
  { id: 'submarine', name: 'Submarino', size: 3, count: 1, color: 'bg-violet-500', emoji: '🔱' },
  { id: 'destroyer', name: 'Destructor', size: 2, count: 1, color: 'bg-amber-500', emoji: '⛵' },
];

export const TOTAL_SHIP_CELLS = SHIP_DEFS.reduce((sum, s) => sum + s.size * s.count, 0);

export const MESSAGES = {
  WELCOME_TITLE: '⚓ Batalla Naval',
  WELCOME_SUB: 'Hunde la flota enemiga antes de que hundan la tuya',
  SETUP_HINT: 'Selecciona un barco y haz clic en el tablero para colocarlo. Presiona R para rotar.',
  ALL_PLACED: '¡Todos los barcos colocados! Presiona "Iniciar batalla".',
  PLAYER_TURN: 'Tu turno — Selecciona una celda en el tablero enemigo.',
  PC_TURN: 'Turno de la PC...',
  HIT: '💥 ¡Impacto!',
  MISS: '🌊 Agua...',
  SUNK: '🔥 ¡Barco hundido!',
  ALREADY_ATTACKED: 'Ya disparaste en esa celda.',
  INVALID_PLACEMENT: 'Posición inválida. Intenta otra celda.',
  OVERLAP: 'No puedes colocar un barco sobre otro.',
  OUT_OF_BOUNDS: 'El barco se sale del tablero.',
  NO_SHIP_SELECTED: 'Selecciona un barco primero.',
  SHIP_EXHAUSTED: 'Ya colocaste todos los barcos de ese tipo.',
  PLAYER_WINS: '🎉 ¡Victoria! ¡Has hundido toda la flota enemiga!',
  PC_WINS: '💀 Derrota... La PC hundió toda tu flota.',
  GAME_OVER: 'Fin del juego',
  TURN_TIMEOUT: '⏰ ¡Se acabó el tiempo! Disparo automático.',
};

export const TURN_TIME = 15;