import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/mastra';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

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

    // Mastraエージェントでチャット応答を生成
    const response = await agent.generate(userMessage, {
      maxSteps: 3,
    });

    return NextResponse.json({
      message: response.text,
      role: 'assistant',
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
