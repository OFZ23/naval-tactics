# ⚓ Batalla Naval

Juego clásico de Batalla Naval para navegador, jugador contra PC, con IA adaptativa y diseño naval inmersivo.

---

## 🎮 ¿De qué trata?

Coloca tu flota en el tablero y destruye todos los barcos enemigos antes de que hundan los tuyos. Dispones de 15 segundos por turno o el disparo se realiza automáticamente. El juego incluye 3 niveles de dificultad con una IA que aprende de sus impactos.

---

## 🚢 Características

- **Tablero 10×10** con coordenadas alfanuméricas (A–J / 1–10)
- **4 tipos de barcos**: Portaviones (5), Acorazado (4), Submarino (3), Destructor (2)
- **3 niveles de dificultad**:
  - 🟢 Fácil — disparos aleatorios
  - 🟡 Normal — IA busca celdas adyacentes al impacto
  - 🔴 Difícil — IA detecta la dirección del barco y lo remata
- **Temporizador por turno** (15 s) con disparo automático
- **Vista previa** de colocación de barcos con indicador de validez
- **Colocación automática** de barcos con un clic
- **Registro de batalla** en tiempo real
- **Modal de fin de partida** con estadísticas (precisión, turnos, disparos)
- **Tabla de mejores partidas** guardada en localStorage
- Diseño **responsive** (móvil y escritorio)

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| **React 18** | Framework principal de UI |
| **Tailwind CSS** | Estilos y diseño responsivo |
| **shadcn/ui** | Componentes de UI (Button, Dialog, Progress…) |
| **Radix UI** | Primitivos de accesibilidad |
| **Lucide React** | Íconos |
| **Framer Motion** | Animaciones |
| **React Router DOM** | Navegación |
| **TanStack Query** | Gestión de estado del servidor |
| **Google Fonts (Orbitron + Inter)** | Tipografía temática |

---

## 📁 Estructura del proyecto

```
src/
├── pages/
│   └── BattleShip.jsx          # Página principal del juego
├── components/
│   └── battleship/
│       ├── Board.jsx            # Tablero de juego
│       ├── BoardCell.jsx        # Celda individual
│       ├── ShipSelector.jsx     # Panel de selección de barcos
│       ├── GameHUD.jsx          # Indicadores de estado
│       ├── MessageLog.jsx       # Registro de batalla
│       ├── WelcomeScreen.jsx    # Pantalla de inicio
│       └── GameOverModal.jsx    # Modal de fin de partida
├── lib/
│   ├── gameConstants.js         # Constantes del juego
│   ├── gameLogic.js             # Lógica de juego e IA
│   └── scoreManager.js          # Gestión de puntuaciones
└── index.css                    # Variables de diseño y tema naval
```

---

## 🎯 Cómo jugar

1. Elige la dificultad en la pantalla de inicio.
2. Coloca tus barcos en el tablero izquierdo haciendo clic. Pulsa **R** para rotar.
3. Usa el botón **Auto** para colocación aleatoria automática.
4. Pulsa **Iniciar Batalla** cuando todos los barcos estén colocados.
5. Haz clic en el tablero enemigo para disparar. ¡Tienes 15 segundos por turno!
6. Hunde toda la flota enemiga para ganar.

---

## 📐 Diagrama de Casos de Uso

```plantuml
@startuml CasosDeUso_BatallaNaval

left to right direction
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor "Jugador" as Jugador
actor "PC (IA)" as PC
actor "Sistema" as Sistema

rectangle "Batalla Naval" {

  usecase "Iniciar nueva partida"           as UC1
  usecase "Seleccionar dificultad"          as UC2
  usecase "Colocar barcos manualmente"      as UC3
  usecase "Colocar barcos automáticamente"  as UC4
  usecase "Rotar barco (tecla R)"           as UC5
  usecase "Limpiar tablero"                 as UC6
  usecase "Iniciar batalla"                 as UC7
  usecase "Disparar al tablero enemigo"     as UC8
  usecase "Ver registro de batalla"         as UC9
  usecase "Ver estadísticas finales"        as UC10
  usecase "Ver mejores partidas"            as UC11
  usecase "Reiniciar / Volver al inicio"    as UC12

  usecase "Disparar al tablero del jugador" as UC13
  usecase "Modo caza: disparo aleatorio"    as UC14
  usecase "Modo objetivo: adyacente"        as UC15
  usecase "Modo difícil: detectar dirección" as UC16

  usecase "Validar colocación de barco"     as UC17
  usecase "Controlar temporizador de turno" as UC18
  usecase "Detectar barco hundido"          as UC19
  usecase "Verificar condición de victoria" as UC20
  usecase "Guardar puntuación"              as UC21

}

Jugador --> UC1
Jugador --> UC2
Jugador --> UC3
Jugador --> UC4
Jugador --> UC5
Jugador --> UC6
Jugador --> UC7
Jugador --> UC8
Jugador --> UC9
Jugador --> UC10
Jugador --> UC11
Jugador --> UC12

PC --> UC13

Sistema --> UC17
Sistema --> UC18
Sistema --> UC19
Sistema --> UC20
Sistema --> UC21

UC3 ..> UC17 : <<include>>
UC7  ..> UC18 : <<include>>
UC8  ..> UC19 : <<include>>
UC13 ..> UC19 : <<include>>
UC19 ..> UC20 : <<include>>
UC20 ..> UC21 : <<include>>

UC13 ..> UC14 : <<extend>>\nFácil
UC13 ..> UC15 : <<extend>>\nNormal
UC13 ..> UC16 : <<extend>>\nDifícil

@enduml
```

---

## 🏗️ Diagrama de Clases

```plantuml
@startuml Clases_BatallaNaval

skinparam classAttributeIconSize 0
skinparam linetype ortho

class BattleShip {
  - phase : PHASES
  - difficulty : string
  - playerBoard : Cell[][]
  - pcBoard : Cell[][]
  - turn : string
  - turnCount : number
  - timeLeft : number
  - messages : Message[]
  - aiMemory : AIMemory
  + handleStart(diff : string) : void
  + handlePlaceShip(row : number, col : number) : void
  + handlePlayerShot(row : number, col : number) : void
  + handleAutoPlace() : void
  + handleStartBattle() : void
  + handleRestart() : void
  + handleHome() : void
}

class Cell {
  + state : CELL_STATE
  + shipId : string
}

class AIMemory {
  + hits : Coordinate[]
}

class Coordinate {
  + r : number
  + c : number
}

class ShipDef {
  + id : string
  + name : string
  + size : number
  + count : number
  + color : string
  + emoji : string
}

class Message {
  + text : string
  + type : string
}

class gameLogic {
  + createEmptyBoard() : Cell[][]
  + canPlaceShip(board, row, col, size, horizontal) : boolean
  + placeShip(board, row, col, size, horizontal, shipId) : Cell[][]
  + fireAt(board, row, col) : FireResult
  + allShipsSunk(board) : boolean
  + autoPlaceShips(board) : Cell[][]
  + getAIShot(board, difficulty, aiMemory) : Coordinate
  + markSunk(board, shipId) : Cell[][]
  + isShipSunk(board, shipId) : boolean
  + getAccuracy(shots, hits) : number
  + countHits(board) : number
  + countSunkShips(board) : number
}

class scoreManager {
  + getTopScores() : Score[]
  + saveScore(entry) : Score[]
}

class Score {
  + difficulty : string
  + turns : number
  + accuracy : number
  + won : boolean
  + date : string
}

class gameConstants {
  + BOARD_SIZE : number
  + COLS : string[]
  + PHASES : object
  + CELL : object
  + DIFFICULTY : object
  + SHIP_DEFS : ShipDef[]
  + TOTAL_SHIP_CELLS : number
  + TURN_TIME : number
}

class Board {
  + board : Cell[][]
  + title : string
  + isPlayerBoard : boolean
  + previewCells : Coordinate[]
  + onCellClick(row, col) : void
  + onCellHover(row, col) : void
  + onCellLeave() : void
}

class BoardCell {
  + cell : Cell
  + row : number
  + col : number
  + isPreview : boolean
  + isInvalidPreview : boolean
  + onClick() : void
  + onMouseEnter() : void
}

class ShipSelector {
  + selectedShip : ShipDef
  + placedCounts : object
  + horizontal : boolean
  + onSelectShip(ship) : void
  + onToggleOrientation() : void
  + onAutoPlace() : void
  + onClearBoard() : void
}

class GameHUD {
  + playerBoard : Cell[][]
  + pcBoard : Cell[][]
  + turn : string
  + turnCount : number
  + timeLeft : number
  + playerShots : number
  + playerHits : number
}

class MessageLog {
  + messages : Message[]
}

class WelcomeScreen {
  + onStart(difficulty : string) : void
}

class GameOverModal {
  + open : boolean
  + winner : string
  + turnCount : number
  + playerShots : number
  + playerHits : number
  + onRestart() : void
  + onHome() : void
}

' Composición principal
BattleShip "1" *-- "2" Board           : renders
BattleShip "1" *-- "1" ShipSelector    : renders
BattleShip "1" *-- "1" GameHUD         : renders
BattleShip "1" *-- "1" MessageLog      : renders
BattleShip "1" *-- "1" GameOverModal   : renders
BattleShip "1" *-- "1" WelcomeScreen   : renders

' Dependencias de lógica
BattleShip ..> gameLogic     : <<uses>>
BattleShip ..> scoreManager  : <<uses>>
BattleShip ..> gameConstants : <<uses>>

' Composición de tablero
Board "1" *-- "100" BoardCell : renders
Board ..> Cell                : <<uses>>

' Dependencias de lógica de juego
gameLogic ..> Cell       : creates / modifies
gameLogic ..> ShipDef    : reads
gameLogic ..> AIMemory   : reads
gameLogic ..> gameConstants : <<uses>>

' Gestión de puntuaciones
scoreManager "1" *-- "*" Score : manages

' Datos internos
AIMemory "1" *-- "*" Coordinate : contains
Cell ..> ShipDef                : references via shipId

@enduml
```

---

## 📜 Licencia

MIT