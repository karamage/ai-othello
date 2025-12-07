'use client';

import { useState, useCallback } from 'react';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import {
  Board,
  Player,
  createEmptyBoard,
  isValidMove,
  makeMove,
  getValidMoves,
  countPieces,
  isGameOver,
  getWinner,
  findBestMove,
  getOpponent,
} from '@/lib/game/othello';

export default function OthelloGame() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [gameOver, setGameOver] = useState(false);

  // CopilotKitにゲーム状態を提供
  useCopilotReadable({
    description: 'オセロゲームの現在の状態',
    value: {
      board,
      currentPlayer,
      gameOver,
      validMoves: getValidMoves(board, currentPlayer),
      pieceCount: countPieces(board),
      winner: getWinner(board),
    },
  });

  // 石を置く処理
  const placePiece = useCallback((row: number, col: number, player: Player) => {
    if (gameOver) {
      return { success: false, message: 'ゲームは終了しています' };
    }

    if (player !== currentPlayer) {
      return { success: false, message: `現在は${currentPlayer === 'black' ? '黒' : '白'}の番です` };
    }

    if (!isValidMove(board, row, col, player)) {
      return { success: false, message: 'そこには置けません' };
    }

    const newBoard = makeMove(board, row, col, player);
    setBoard(newBoard);

    // 次のプレイヤーに交代
    const nextPlayer = getOpponent(player);
    const nextValidMoves = getValidMoves(newBoard, nextPlayer);

    // 次のプレイヤーが打てる手があるかチェック
    if (nextValidMoves.length === 0) {
      // パス: 元のプレイヤーの番に戻る
      const originalValidMoves = getValidMoves(newBoard, player);
      if (originalValidMoves.length === 0) {
        // 両者とも打てない = ゲーム終了
        setGameOver(true);
        return { success: true, message: 'ゲーム終了！', gameOver: true };
      }
      return { success: true, message: `${nextPlayer === 'black' ? '黒' : '白'}はパスです`, pass: true };
    }

    setCurrentPlayer(nextPlayer);

    // ゲーム終了チェック
    if (isGameOver(newBoard)) {
      setGameOver(true);
      return { success: true, message: 'ゲーム終了！', gameOver: true };
    }

    return { success: true, message: '成功' };
  }, [board, currentPlayer, gameOver]);

  // AIが石を置くアクション
  useCopilotAction({
    name: 'placeOthelloPiece',
    description: 'オセロの盤面に石を配置します。AIの番の時に最適な手を選んで石を置きます。',
    parameters: [
      {
        name: 'row',
        type: 'number',
        description: '行番号（0-7）',
        required: true,
      },
      {
        name: 'col',
        type: 'number',
        description: '列番号（0-7）',
        required: true,
      },
    ],
    handler: async ({ row, col }) => {
      const result = placePiece(row, col, 'white'); // AIは白
      return JSON.stringify(result);
    },
  });

  // AIに最適な手を計算させるアクション
  useCopilotAction({
    name: 'getAIMove',
    description: 'AIが最適な手を計算します。Minimaxアルゴリズムを使用して最良の手を見つけます。',
    parameters: [
      {
        name: 'difficulty',
        type: 'number',
        description: '難易度（1-5、デフォルトは3）',
        required: false,
      },
    ],
    handler: async ({ difficulty = 3 }) => {
      const bestMove = findBestMove(board, 'white', difficulty);
      if (bestMove) {
        return JSON.stringify({
          row: bestMove[0],
          col: bestMove[1],
          message: `最適な手: (${bestMove[0]}, ${bestMove[1]})`,
        });
      }
      return JSON.stringify({ message: '有効な手がありません' });
    },
  });

  // ゲームをリセットするアクション
  useCopilotAction({
    name: 'resetOthelloGame',
    description: 'オセロゲームをリセットして新しいゲームを開始します',
    parameters: [],
    handler: async () => {
      setBoard(createEmptyBoard());
      setCurrentPlayer('black');
      setGameOver(false);
      return 'ゲームをリセットしました';
    },
  });

  // マウスクリックで石を置く
  const handleCellClick = (row: number, col: number) => {
    if (currentPlayer === 'black') {
      placePiece(row, col, 'black');
    }
  };

  // AIの自動プレイ
  const handleAIMove = () => {
    if (currentPlayer === 'white' && !gameOver) {
      const bestMove = findBestMove(board, 'white', 3);
      if (bestMove) {
        setTimeout(() => {
          placePiece(bestMove[0], bestMove[1], 'white');
        }, 500);
      }
    }
  };

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer('black');
    setGameOver(false);
  };

  const validMoves = getValidMoves(board, currentPlayer);
  const { black, white } = countPieces(board);
  const winner = getWinner(board);

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h1 className="text-3xl font-bold">オセロ vs AI</h1>

      {/* ゲーム情報 */}
      <div className="flex gap-8 text-lg">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-black border-2 border-gray-300"></div>
          <span>黒: {black}</span>
          {currentPlayer === 'black' && !gameOver && <span className="text-green-600 font-bold">← あなたの番</span>}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-800"></div>
          <span>白: {white}</span>
          {currentPlayer === 'white' && !gameOver && <span className="text-blue-600 font-bold">← AIの番</span>}
        </div>
      </div>

      {/* 勝敗表示 */}
      {gameOver && (
        <div className="text-2xl font-bold text-red-600">
          {winner === 'black' && '黒の勝ち！'}
          {winner === 'white' && '白の勝ち！'}
          {winner === 'draw' && '引き分け！'}
        </div>
      )}

      {/* オセロボード */}
      <div className="inline-block bg-green-700 p-2 rounded shadow-lg">
        <div className="grid grid-cols-8 gap-0.5">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isValid = validMoves.some(([r, c]) => r === rowIndex && c === colIndex);
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  disabled={gameOver || currentPlayer !== 'black'}
                  className={`
                    w-12 h-12 bg-green-600 border border-green-800
                    flex items-center justify-center
                    transition-all duration-200
                    ${isValid && currentPlayer === 'black' ? 'hover:bg-green-500 cursor-pointer' : ''}
                    ${currentPlayer !== 'black' ? 'cursor-not-allowed' : ''}
                  `}
                >
                  {cell && (
                    <div
                      className={`
                        w-10 h-10 rounded-full
                        ${cell === 'black' ? 'bg-black' : 'bg-white'}
                        border-2 ${cell === 'black' ? 'border-gray-700' : 'border-gray-300'}
                        shadow-md
                      `}
                    />
                  )}
                  {isValid && currentPlayer === 'black' && !cell && (
                    <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-60" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ボタン */}
      <div className="flex gap-4">
        <button
          onClick={resetGame}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          リセット
        </button>
        {currentPlayer === 'white' && !gameOver && (
          <button
            onClick={handleAIMove}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            AIに打たせる
          </button>
        )}
      </div>

      {/* ヒント */}
      <div className="text-sm text-gray-600 max-w-md text-center">
        <p>黒（あなた）vs 白（AI）で対戦します。</p>
        <p>黄色い点が置ける場所です。</p>
        <p>チャットでAIに「次の手を教えて」や「最適な手を打って」と話しかけることもできます。</p>
      </div>
    </div>
  );
}
