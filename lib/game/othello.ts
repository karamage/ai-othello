// オセロのセルの状態
export type Cell = 'black' | 'white' | null;

// ボードは8x8
export type Board = Cell[][];

// プレイヤー
export type Player = 'black' | 'white';

// 方向（8方向）
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

// 空のボードを作成
export function createEmptyBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));

  // 初期配置（中央4マス）
  board[3][3] = 'white';
  board[3][4] = 'black';
  board[4][3] = 'black';
  board[4][4] = 'white';

  return board;
}

// 指定位置が盤面内かチェック
function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// 相手の色を取得
export function getOpponent(player: Player): Player {
  return player === 'black' ? 'white' : 'black';
}

// 指定方向に石をひっくり返せるかチェック
function canFlipInDirection(
  board: Board,
  row: number,
  col: number,
  player: Player,
  dRow: number,
  dCol: number
): number {
  const opponent = getOpponent(player);
  let count = 0;
  let r = row + dRow;
  let c = col + dCol;

  // 隣が相手の石であることを確認
  if (!isInBounds(r, c) || board[r][c] !== opponent) {
    return 0;
  }

  // 相手の石を数える
  while (isInBounds(r, c) && board[r][c] === opponent) {
    count++;
    r += dRow;
    c += dCol;
  }

  // 最後が自分の石であれば、ひっくり返せる
  if (isInBounds(r, c) && board[r][c] === player) {
    return count;
  }

  return 0;
}

// 指定位置に石を置けるかチェック
export function isValidMove(board: Board, row: number, col: number, player: Player): boolean {
  // すでに石が置かれている
  if (board[row][col] !== null) {
    return false;
  }

  // いずれかの方向で石をひっくり返せるか
  for (const [dRow, dCol] of DIRECTIONS) {
    if (canFlipInDirection(board, row, col, player, dRow, dCol) > 0) {
      return true;
    }
  }

  return false;
}

// 有効な手をすべて取得
export function getValidMoves(board: Board, player: Player): [number, number][] {
  const moves: [number, number][] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (isValidMove(board, row, col, player)) {
        moves.push([row, col]);
      }
    }
  }

  return moves;
}

// 石を置いてボードを更新
export function makeMove(board: Board, row: number, col: number, player: Player): Board {
  // ボードをコピー
  const newBoard = board.map(row => [...row]);

  // 石を置く
  newBoard[row][col] = player;

  // 各方向で石をひっくり返す
  for (const [dRow, dCol] of DIRECTIONS) {
    const flipCount = canFlipInDirection(board, row, col, player, dRow, dCol);
    if (flipCount > 0) {
      let r = row + dRow;
      let c = col + dCol;
      for (let i = 0; i < flipCount; i++) {
        newBoard[r][c] = player;
        r += dRow;
        c += dCol;
      }
    }
  }

  return newBoard;
}

// 石の数をカウント
export function countPieces(board: Board): { black: number; white: number } {
  let black = 0;
  let white = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === 'black') black++;
      if (board[row][col] === 'white') white++;
    }
  }

  return { black, white };
}

// ゲームが終了したかチェック
export function isGameOver(board: Board): boolean {
  // 両プレイヤーとも打てる手がない場合、ゲーム終了
  const blackMoves = getValidMoves(board, 'black');
  const whiteMoves = getValidMoves(board, 'white');

  return blackMoves.length === 0 && whiteMoves.length === 0;
}

// 勝者を判定
export function getWinner(board: Board): 'black' | 'white' | 'draw' | null {
  if (!isGameOver(board)) {
    return null;
  }

  const { black, white } = countPieces(board);

  if (black > white) return 'black';
  if (white > black) return 'white';
  return 'draw';
}

// ボードを評価（簡易版）
export function evaluateBoard(board: Board, player: Player): number {
  const counts = countPieces(board);
  const opponent = getOpponent(player);

  // 角の価値を高く評価
  const corners = [
    [0, 0], [0, 7], [7, 0], [7, 7]
  ];

  let score = counts[player] - counts[opponent];

  // 角のボーナス
  for (const [row, col] of corners) {
    if (board[row][col] === player) score += 25;
    if (board[row][col] === opponent) score -= 25;
  }

  // 有効手の数（モビリティ）
  const playerMoves = getValidMoves(board, player).length;
  const opponentMoves = getValidMoves(board, opponent).length;
  score += (playerMoves - opponentMoves) * 2;

  return score;
}

// Minimaxアルゴリズム（簡易版）
export function findBestMove(
  board: Board,
  player: Player,
  depth: number = 3
): [number, number] | null {
  const validMoves = getValidMoves(board, player);

  if (validMoves.length === 0) {
    return null;
  }

  let bestMove: [number, number] = validMoves[0];
  let bestScore = -Infinity;

  for (const [row, col] of validMoves) {
    const newBoard = makeMove(board, row, col, player);
    const score = minimax(newBoard, depth - 1, false, player, -Infinity, Infinity);

    if (score > bestScore) {
      bestScore = score;
      bestMove = [row, col];
    }
  }

  return bestMove;
}

function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  player: Player,
  alpha: number,
  beta: number
): number {
  if (depth === 0 || isGameOver(board)) {
    return evaluateBoard(board, player);
  }

  const currentPlayer = isMaximizing ? player : getOpponent(player);
  const validMoves = getValidMoves(board, currentPlayer);

  // パスの場合
  if (validMoves.length === 0) {
    return minimax(board, depth - 1, !isMaximizing, player, alpha, beta);
  }

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const [row, col] of validMoves) {
      const newBoard = makeMove(board, row, col, currentPlayer);
      const score = minimax(newBoard, depth - 1, false, player, alpha, beta);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // アルファベータ枝刈り
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const [row, col] of validMoves) {
      const newBoard = makeMove(board, row, col, currentPlayer);
      const score = minimax(newBoard, depth - 1, true, player, alpha, beta);
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break; // アルファベータ枝刈り
    }
    return minScore;
  }
}
