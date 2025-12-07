'use client';

import { CopilotKit } from '@copilotkit/react-core';
import { CopilotChat } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';

export default function ChatInterface() {
  return (
    <div className="h-screen w-full">
      <CopilotKit runtimeUrl="/api/copilotkit">
        <CopilotChat
          labels={{
            title: 'AIアシスタント',
            initial: 'こんにちは!何かお手伝いできることはありますか?',
          }}
          className="h-full"
        />
      </CopilotKit>
    </div>
  );
}
