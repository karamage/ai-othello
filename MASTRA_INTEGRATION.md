# Mastraエージェント統合ドキュメント

## 概要

このプロジェクトでは、Mastraのエージェント機能をオセロゲームAIアシスタントに統合しています。

## 主な変更点

### 1. Mastraエージェント設定 ([lib/mastra.ts](lib/mastra.ts))

- **Mastraインスタンス**: オセロゲーム用のMastraインスタンスを作成
- **エージェント**: `othello-assistant`という名前のエージェントを定義
- **ツール**:
  - `place-disc`: オセロの盤面に石を置く
  - `suggest-best-move`: 現在の盤面を分析して最適な手を提案

### 2. Mastra APIエンドポイント ([app/api/mastra/route.ts](app/api/mastra/route.ts))

Mastraエージェント専用のAPIエンドポイントを作成しました。

**エンドポイント**: `POST /api/mastra`

**リクエストボディ**:
```json
{
  "message": "ユーザーからのメッセージ",
  "board": "盤面データ（8x8の配列）",
  "currentPlayer": "black | white",
  "validMoves": "置ける場所の配列",
  "pieceCount": {
    "black": "黒石の数",
    "white": "白石の数"
  }
}
```

**レスポンス**:
```json
{
  "success": true,
  "response": "エージェントからの応答テキスト",
  "toolCalls": []
}
```

### 3. エージェントの機能

#### システムプロンプト

エージェントは以下の役割を果たします:

1. **質問対応**: ユーザーがオセロについて質問した場合に丁寧に答える
2. **自動プレイ**: 「手を打って」「石を置いて」などの指示に対して最適な手を実行
3. **アドバイス**: 「次の手を教えて」などの質問に対して最適な手を提案
4. **戦略的判断**: 角を取る、多くの石を返す、相手に角を取らせないなどの戦略を考慮

#### 利用可能なツール

##### place-disc
- **説明**: オセロの盤面に石を置く
- **入力**:
  - `row`: 石を置く行（0-7）
  - `col`: 石を置く列（0-7）
- **用途**: ユーザーが「手を打って」などと言った場合に使用

##### suggest-best-move
- **説明**: 盤面を分析して最適な手を提案
- **入力**:
  - `board`: 盤面データ（8x8の配列）
  - `player`: 現在のプレイヤー（black | white）
- **用途**: ユーザーが「次の手を教えて」などと言った場合に使用

## 使用方法

### 1. 環境変数の設定

`.env.local`ファイルに以下を設定:

```bash
OPENAI_API_KEY=your_openai_api_key
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

### 3. エージェントの呼び出し

クライアント側から以下のようにMastraエージェントを呼び出せます:

```typescript
const response = await fetch('/api/mastra', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'ユーザーからのメッセージ',
    board: currentBoard,
    currentPlayer: currentPlayer,
    validMoves: validMoves,
    pieceCount: pieceCount,
  }),
});

const data = await response.json();
console.log(data.response); // エージェントからの応答
console.log(data.toolCalls); // 呼び出されたツール
```

## アーキテクチャ

```
┌─────────────────┐
│  React Client   │
│ (OthelloGame)   │
└────────┬────────┘
         │
         ├─── CopilotKit (UI/チャット) ──→ /api/copilotkit
         │
         └─── Mastra Agent ──────────────→ /api/mastra
                                              │
                                              ↓
                                         ┌──────────────┐
                                         │ chatAgent    │
                                         │ (Mastra)     │
                                         └──────┬───────┘
                                                │
                                    ┌───────────┴───────────┐
                                    │                       │
                              place-disc            suggest-best-move
                              (ツール)                  (ツール)
```

## 今後の改善案

1. **ストリーミング対応**: エージェントの応答をストリーミングで返す
2. **会話履歴の保持**: 複数ターンにわたる会話を管理
3. **カスタムツールの追加**: ゲームのリセット、履歴の表示など
4. **エラーハンドリングの強化**: より詳細なエラーメッセージとリトライロジック
5. **パフォーマンス最適化**: キャッシュや並列処理の導入

## トラブルシューティング

### Mastra Telemetry警告について

ビルド時に以下の警告が表示される場合があります:

```
Mastra telemetry is enabled, but the required instrumentation file was not loaded.
```

これは警告のみで、機能には影響しません。Mastra Serverを使用していない場合は無視して問題ありません。

テレメトリを無効化したい場合は、`instrumentation.ts`ファイルを作成して以下を追加:

```typescript
export function register() {
  globalThis.___MASTRA_TELEMETRY___ = true;
}
```
