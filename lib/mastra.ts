import { Mastra } from '@mastra/core';
import { Agent } from '@mastra/core';
import { createTool } from '@mastra/core';
import { z } from 'zod';

// Mastraインスタンスを作成
export const mastra = new Mastra({
  agents: {},
});

// オセロの手を打つためのツールを定義
export const placeDiscTool = createTool({
  id: 'place-disc',
  description: 'オセロの盤面に石を置く。ユーザーが「手を打って」「石を置いて」などと言った場合に使用する。',
  inputSchema: z.object({
    row: z.number().min(0).max(7).describe('石を置く行（0-7）'),
    col: z.number().min(0).max(7).describe('石を置く列（0-7）'),
  }),
  execute: async ({ context }) => {
    // このツールは実際には実行されず、クライアント側で処理される
    // ここではツールが呼び出されたことを示すレスポンスを返す
    const { row, col } = context;
    return {
      success: true,
      action: 'place-disc',
      position: { row, col },
      message: `(${row}, ${col})に石を置きます`,
    };
  },
});

// AIエージェントを定義
export const chatAgent = new Agent({
  name: 'chat-agent',
  instructions: `あなたはオセロゲームのAIアシスタントです。以下の役割を果たしてください:

1. ユーザーがオセロについて質問した場合は、丁寧に答えてください
2. ユーザーが「手を打って」「石を置いて」「最適な手を打って」などと言った場合は、盤面情報を分析して最適な位置を判断し、place-discツールを使って実際に手を打ってください
3. 盤面情報には「現在置ける場所」が表示されています。その中から最も有利な手を選んでください
4. 手を打つ際は、角を取る、多くの石を返す、相手に角を取らせない、などの戦略を考慮してください

重要: ユーザーが手を打つことを求めている場合は、必ずplace-discツールを呼び出してください。説明だけでなく、実際にツールを使って手を打つことが重要です。`,
  model: 'openai/gpt-4o-mini',
  tools: {
    'place-disc': placeDiscTool,
  },
});

// エージェントをエクスポート
export function getAgent() {
  return chatAgent;
}
