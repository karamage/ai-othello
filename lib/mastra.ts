import { Mastra } from '@mastra/core';
import { Agent } from '@mastra/core';

// Mastraインスタンスを作成
export const mastra = new Mastra({
  agents: {},
});

// AIエージェントを定義
export const chatAgent = new Agent({
  name: 'chat-agent',
  instructions: 'あなたは親切で役に立つAIアシスタントです。ユーザーの質問に丁寧に答えてください。',
  model: 'openai/gpt-4o-mini',
});

// エージェントをエクスポート
export function getAgent() {
  return chatAgent;
}
