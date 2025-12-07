import { NextRequest, NextResponse } from 'next/server';
import { chatAgent } from '@/lib/mastra';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, board, currentPlayer, validMoves, pieceCount } = body;

    // 盤面情報をコンテキストとして整形
    const boardContext = board ? `
現在の盤面状態:
- 現在のプレイヤー: ${currentPlayer === 'black' ? '黒' : '白'}
- 置ける場所: ${JSON.stringify(validMoves || [])}
- 石の数: 黒=${pieceCount?.black || 0}, 白=${pieceCount?.white || 0}
- 盤面データ: ${JSON.stringify(board)}
` : '';

    // Mastraエージェントを実行
    const result = await chatAgent.generate(
      `${boardContext}\n\nユーザーからのメッセージ: ${message}`
    );

    return NextResponse.json({
      success: true,
      response: result.text,
      toolCalls: result.toolCalls || [],
    });
  } catch (error) {
    console.error('Mastra agent error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
