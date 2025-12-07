import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/mastra';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { messages, boardState } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      );
    }

    // 環境変数をチェック
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const agent = getAgent();

    // ユーザーの最新メッセージを取得
    const userMessage = messages[messages.length - 1]?.content || '';

    // 盤面情報をコンテキストとして整形
    let contextMessage = userMessage;
    if (boardState) {
      const boardContext = formatBoardContext(boardState);
      contextMessage = `${boardContext}\n\nユーザーの質問: ${userMessage}`;
    }

    // Mastraエージェントでチャット応答を生成
    const response = await agent.generate(contextMessage, {
      maxSteps: 3,
    });

    // ツール呼び出しがあるかチェック
    let toolCalls = null;
    if (response.steps && response.steps.length > 0) {
      for (const step of response.steps) {
        if (step.toolCalls && step.toolCalls.length > 0) {
          // place-discツールの呼び出しを探す
          for (const tc of step.toolCalls) {
            const toolCall = tc as any;
            if (toolCall.toolName === 'place-disc' && toolCall.args) {
              toolCalls = {
                action: 'place-disc',
                position: {
                  row: toolCall.args.row,
                  col: toolCall.args.col,
                }
              };
              break;
            }
          }
          if (toolCalls) break;
        }
      }
    }

    return NextResponse.json({
      message: response.text,
      role: 'assistant',
      toolCalls,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 盤面情報を読みやすい形式に整形
function formatBoardContext(boardState: any): string {
  const { board, currentPlayer, gameOver, validMoves, pieceCount, winner } = boardState;

  let context = '【オセロゲームの現在の状態】\n\n';

  // 盤面の表示（テキスト形式）
  context += '盤面:\n';
  context += '  0 1 2 3 4 5 6 7\n';
  board.forEach((row: any[], rowIndex: number) => {
    context += `${rowIndex} `;
    row.forEach((cell: string | null) => {
      if (cell === 'black') {
        context += '● ';
      } else if (cell === 'white') {
        context += '○ ';
      } else {
        context += '· ';
      }
    });
    context += '\n';
  });

  context += '\n';
  context += `現在の手番: ${currentPlayer === 'black' ? '黒(●)' : '白(○)'}\n`;
  context += `石の数: 黒=${pieceCount.black}個、白=${pieceCount.white}個\n`;
  context += `ゲーム状態: ${gameOver ? '終了' : '進行中'}\n`;

  if (gameOver && winner) {
    const winnerText = winner === 'black' ? '黒の勝ち' : winner === 'white' ? '白の勝ち' : '引き分け';
    context += `勝敗: ${winnerText}\n`;
  }

  if (validMoves && validMoves.length > 0) {
    context += `\n現在置ける場所: `;
    context += validMoves.map(([r, c]: [number, number]) => `(${r},${c})`).join(', ');
    context += '\n';
  }

  return context;
}
