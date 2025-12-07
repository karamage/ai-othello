# AI オセロゲーム - Mastra + CopilotKit(AG-UI)

Next.js App RouterとMastra AIエージェント、CopilotKit UIを使用したAI対戦型オセロゲームです。

![AI Othello Game Screenshot](https://github.com/user-attachments/assets/2fc7d3e0-14bf-48e6-817f-60819d6ef714)

## 機能

- **オセロゲーム**: 完全機能のオセロ（リバーシ）ゲーム
- **AI対戦**: Minimaxアルゴリズムを使用した戦略的なAI
- **チャットアシスタント**: CopilotKitによる対話型AIアシスタント
- **音声指示**: チャットでAIに指示を出して石を置くことができます

## 技術スタック

- **Next.js 15** (App Router)
- **Mastra** - AIエージェントAPI (サーバー側)
- **CopilotKit** - チャットUI + AI統合 (フロントエンド)
- **OpenAI GPT-4o-mini** - 言語モデル
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング

## プロジェクト構成

```
ai-othello/
├── app/
│   ├── api/
│   │   ├── mastra/         # Mastra エージェント API ルート
│   │   └── copilotkit/     # CopilotKit ランタイム API
│   ├── globals.css         # グローバルスタイル
│   ├── layout.tsx          # ルートレイアウト
│   └── page.tsx            # メインページ
├── components/
│   ├── ChatInterface.tsx      # チャット UI コンポーネント
│   ├── OthelloGame.tsx        # オセロゲームコンポーネント (CopilotKit統合)
│   └── OthelloWithChat.tsx    # オセロ + チャット統合
├── lib/
│   ├── mastra.ts           # Mastra エージェント & ツール設定
│   └── game/
│       └── othello.ts      # オセロゲームロジック & AI
└── .env.local              # 環境変数
```

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、OpenAI APIキーを設定します:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 主な機能

### オセロゲーム ([lib/game/othello.ts](lib/game/othello.ts))

- 完全なオセロルール実装
- 有効な手の検証
- 石のひっくり返し処理
- ゲーム終了判定と勝敗判定

### AI戦略 (Minimaxアルゴリズム)

- アルファベータ枝刈りを使用した効率的な探索
- ボード評価関数:
  - 角の重要性を評価（+25ボーナス）
  - モビリティ（有効手の数）を考慮
  - 石の数による評価
- 難易度調整可能（探索深度1-5）

### CopilotKit統合 ([components/OthelloGame.tsx](components/OthelloGame.tsx))

**useCopilotReadable**: ゲーム状態をAIに提供
- 現在のボード状態
- 現在のプレイヤー
- 有効な手の一覧
- 石の数
- 勝敗情報

**useCopilotAction**: AIがゲームを操作できるアクション
1. `placeOthelloPiece` - 指定位置に石を置く
2. `getAIMove` - 最適な手を計算
3. `playBestMove` - 最適な手を計算して実行（「一手打って」と言われた時に使用）
4. `resetOthelloGame` - ゲームをリセット

### Mastraエージェント ([lib/mastra.ts](lib/mastra.ts))

**AIエージェント**: `othello-assistant`
- OpenAI GPT-4o-miniモデルを使用
- 戦略的なゲームプレイのための専用指示

**カスタムツール**:
1. `place-disc` - (row, col) の位置に石を置く - 手の実行に使用
2. `suggest-best-move` - ボードを分析して最適な手を提案

**APIエンドポイント**: [app/api/mastra/route.ts](app/api/mastra/route.ts)
- POST `/api/mastra` でゲーム状態とメッセージを受け取り、エージェントの応答を返す

## ビルド

本番環境用にビルド:

```bash
npm run build
```

ビルド済みアプリケーションを起動:

```bash
npm start
```

## 使用方法

### 基本的な遊び方

1. アプリケーションを起動すると、オセロボードとチャットサイドバーが表示されます
2. 黒（あなた）が先手です
3. 黄色い点が表示されている場所をクリックして石を置けます
4. 白（AI）の番になったら、チャットで「一手打って」と入力するとAIが打ちます

### チャットでAIと対話

右側のチャットサイドバーでAIアシスタントと対話できます。CopilotKitとMastraの2つの方法でAIが統合されています:

**プレイヤーとして指示**:
- 「一手打って」- AIが現在のプレイヤーとして最適な手を実行
- 「(3, 4)に置いて」- 指定した位置に石を置く
- 「ゲームをリセットして」- ゲームを最初からやり直す

**アドバイスをもらう**:
- 「次の最適な手を教えて」- AIが最良の手を計算して座標を教えてくれます
- 「どこに置くべき？」- 戦略的なアドバイスをもらえます
- 「現在の状況は？」- ゲームの状態を解説してくれます

### ゲームのルール

- 相手の石を挟むように置くと、挟んだ石が全て自分の色になります
- 有効な手がない場合はパスになります
- 両プレイヤーとも打てる手がなくなったらゲーム終了
- 石の数が多い方が勝ちです

## AIの2つの統合方法

このプロジェクトでは、CopilotKitとMastraの2つのAI統合アプローチを実装しています:

### CopilotKit (クライアント側)
- チャットインターフェースとアクション（`useCopilotAction`）でゲームを直接操作
- ゲーム状態を読み取り可能な形式で公開（`useCopilotReadable`）
- リアルタイムのゲーム状態更新

### Mastra (サーバー側)
- カスタムツール（`place-disc`、`suggest-best-move`）を持つAIエージェント
- `/api/mastra` エンドポイント経由でゲームロジックを実行
- より複雑な推論と戦略的アドバイス

## 注意事項

- OpenAI APIキーが必要です
- APIキーは `.env.local` に保存し、Gitにコミットしないでください

## トラブルシューティング

### ビルド警告: Mastra Telemetry

ビルド時に "Mastra telemetry is enabled, but the required instrumentation file was not loaded." という警告が表示される場合があります。これは無害で無視できます。

警告を非表示にするには、プロジェクトルートに `instrumentation.ts` を作成:

```typescript
export function register() {
  globalThis.___MASTRA_TELEMETRY___ = true;
}
```

### APIエラー

APIが動作しない場合:
- `.env.local` にOpenAI APIキーが正しく設定されているか確認
- APIキーの権限が適切か確認

## ライセンス

MIT
