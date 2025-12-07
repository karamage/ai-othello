# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered Othello (Reversi) game built with Next.js 15, integrating Mastra AI agents and CopilotKit for interactive gameplay. The project demonstrates two AI integration approaches:
- **CopilotKit**: Client-side chat interface with actions (`useCopilotAction`) and readable state (`useCopilotReadable`)
- **Mastra**: Server-side AI agent with custom tools for game logic

## Commands

### Development
```bash
npm run dev     # Start development server on http://localhost:3000
npm run build   # Build for production
npm start       # Start production server
npm run lint    # Run ESLint
```

### Environment Setup
Create `.env.local` with:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Architecture

### Directory Structure
```
app/
├── api/
│   ├── copilotkit/route.ts  # CopilotKit runtime endpoint
│   └── mastra/route.ts      # Mastra agent API endpoint
├── layout.tsx               # Root layout
└── page.tsx                 # Main page (renders OthelloWithChat)

components/
├── OthelloGame.tsx          # Game component with CopilotKit integration
├── ChatInterface.tsx        # Chat UI component
└── OthelloWithChat.tsx      # Container combining game + CopilotKit sidebar

lib/
├── mastra.ts                # Mastra agent and tools configuration
└── game/
    └── othello.ts           # Core game logic and AI (Minimax algorithm)
```

### Key Integration Points

#### CopilotKit Integration ([components/OthelloGame.tsx](components/OthelloGame.tsx))
- **useCopilotReadable**: Exposes game state (board, currentPlayer, validMoves, pieceCount, winner) to AI
- **useCopilotAction**: Defines actions AI can execute:
  - `placeOthelloPiece`: Place a piece at specified position
  - `getAIMove`: Calculate best move using Minimax
  - `playBestMove`: Calculate and execute best move (used when user says "play a move")
  - `resetOthelloGame`: Reset game state

#### Mastra Agent ([lib/mastra.ts](lib/mastra.ts))
- **Agent**: `othello-assistant` with custom instructions for strategic gameplay
- **Tools**:
  - `place-disc`: Places a disc at (row, col) - used for executing moves
  - `suggest-best-move`: Analyzes board and suggests optimal move
- **API Route**: POST `/api/mastra` receives game state and user message, returns agent response with tool calls

### Game Logic ([lib/game/othello.ts](lib/game/othello.ts))

Core game implementation with:
- **Board State**: 8x8 grid with `'black' | 'white' | null` cells
- **Move Validation**: Checks valid moves in all 8 directions
- **Game Engine**: Handles piece placement, flipping, pass detection, game-over logic
- **AI Strategy**: Minimax with alpha-beta pruning (depth 1-5)
  - Corner positions weighted heavily (+25 bonus)
  - Mobility (number of valid moves) evaluated
  - Piece count difference considered

## Development Notes

### Coordinate System
- Board uses row-major indexing: `board[row][col]`
- Coordinates are 0-indexed (0-7 for both row and col)
- **Important**: When displaying coordinates to users, some UI elements show `(col, row)` format - be consistent with existing patterns

### AI Move Execution Flow
1. User sends chat message via CopilotKit UI
2. CopilotKit runtime (OpenAI) processes with exposed actions/state
3. For Mastra flow: message → `/api/mastra` → Mastra agent → tools (place-disc/suggest-best-move)
4. Tool execution or action handler updates React state
5. Board re-renders with new state

### Player Turn Logic
- Black (human) goes first
- After each move, checks if opponent has valid moves:
  - If yes: switch to opponent
  - If no (pass): check if current player still has moves
  - If both have no moves: game over

### Common Tasks

**Adding a new CopilotKit action**:
1. Define action in [components/OthelloGame.tsx](components/OthelloGame.tsx) using `useCopilotAction`
2. Implement handler with game state access (board, currentPlayer, etc.)
3. Return string or JSON.stringify(object) from handler

**Adding a new Mastra tool**:
1. Create tool in [lib/mastra.ts](lib/mastra.ts) using `createTool`
2. Define inputSchema with Zod
3. Add tool to chatAgent's tools object
4. Update agent instructions to describe when to use the tool

**Modifying game rules**:
- Edit functions in [lib/game/othello.ts](lib/game/othello.ts)
- Key functions: `isValidMove`, `makeMove`, `evaluateBoard`, `findBestMove`

## Known Issues

### Mastra Telemetry Warning
Build may show: "Mastra telemetry is enabled, but the required instrumentation file was not loaded."
- This is harmless and can be ignored
- To suppress: create `instrumentation.ts` at root with:
  ```typescript
  export function register() {
    globalThis.___MASTRA_TELEMETRY___ = true;
  }
  ```

## Technology Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Mastra Core v0.24.6 (AI agents)
- CopilotKit v1.10.6 (chat UI + actions)
- OpenAI GPT-4o-mini
