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
  });

  return handleRequest(req);
};
