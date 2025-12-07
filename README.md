# AI オセロゲーム - Mastra + CopilotKit

Next.js App RouterとMastra AIエージェント、CopilotKit UIを使用したAI対戦型オセロゲームです。

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
mastra_next_ag-ui_example/
├── app/
│   ├── api/
│   │   ├── chat/          # Mastra エージェント API ルート
│   │   └── copilotkit/    # CopilotKit ランタイム API
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # メインページ
├── components/
│   ├── ChatInterface.tsx     # チャット UI コンポーネント
│   ├── OthelloGame.tsx       # オセロゲームコンポーネント
│   └── OthelloWithChat.tsx   # オセロ + チャット統合
├── lib/
│   ├── mastra.ts          # Mastra エージェント設定
│   └── game/
│       └── othello.ts     # オセロゲームロジック & AI
└── .env.local             # 環境変数
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
3. `resetOthelloGame` - ゲームをリセット

### Mastraエージェント (サーバー側)

- [lib/mastra.ts](lib/mastra.ts) でAIエージェントを定義
- OpenAI GPT-4o-miniモデルを使用
- [app/api/chat/route.ts](app/api/chat/route.ts) でAPIエンドポイントを提供

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
4. 白（AI）の番になったら、「AIに打たせる」ボタンをクリック

### チャットでAIと対話

チャットでAIアシスタントに以下のような指示を出せます:

- 「次の最適な手を教えて」- AIが最良の手を計算して教えてくれます
- 「白の石を置いて」- AIが自動で最適な位置に石を置きます
- 「ゲームをリセットして」- ゲームを最初からやり直します
- 「どこに置くべき？」- 戦略的なアドバイスをもらえます

### ゲームのルール

- 相手の石を挟むように置くと、挟んだ石が全て自分の色になります
- 有効な手がない場合はパスになります
- 両プレイヤーとも打てる手がなくなったらゲーム終了
- 石の数が多い方が勝ちです

## 注意事項

- OpenAI APIキーが必要です
- APIキーは `.env.local` に保存し、Gitにコミットしないでください
- `.env.example` を参考にして環境変数を設定してください

## トラブルシューティング

### ビルドエラー

型エラーが発生した場合は、以下を確認してください:
- 依存関係が正しくインストールされているか
- TypeScriptの型定義が最新か

### APIエラー

APIが動作しない場合:
- `.env.local` にOpenAI APIキーが正しく設定されているか確認
- APIキーの権限が適切か確認

## ライセンス

MIT
