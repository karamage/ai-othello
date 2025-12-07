import { NextRequest } from 'next/server';
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';

const runtime = new CopilotRuntime();

export const POST = async (req: NextRequest) => {
  const serviceAdapter = new OpenAIAdapter({
    model: 'gpt-4o-mini',
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
    // システムプロンプトを追加して、盤面情報の理解を促進
    instructions: `あなたはオセロゲームのアシスタントです。
現在の盤面状態、プレイヤーの手番、置ける場所などの情報を常に確認して、適切なアドバイスを提供してください。

重要な動作ルール:
1. ユーザーが「手を打って」「石を置いて」「最適な手を打って」などと言った場合は、必ず「playBestMove」アクションを使って実際に石を置いてください
2. 「次の手を教えて」「どこに置けばいい?」などの質問には、「getAIMove」アクションで最適な手の位置を教えてください
3. 盤面の状況を説明する場合は、validMoves（置ける場所）やpieceCount（石の数）などの情報を使ってください

利用可能なアクション:
- playBestMove: AIが最適な手を計算して実際に石を置く（「手を打って」の時に使用）
- getAIMove: 最適な手の位置だけを教える（「どこに置けばいい?」の時に使用）
- placeOthelloPiece: 指定された位置に石を置く
- resetOthelloGame: ゲームをリセットする

盤面の状態情報(board, currentPlayer, validMoves, pieceCountなど)を参照して、具体的で正確なアドバイスを提供してください。`,
  });

  return handleRequest(req);
};
