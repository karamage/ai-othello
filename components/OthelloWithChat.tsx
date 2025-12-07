'use client';

import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';
import OthelloGame from './OthelloGame';

export default function OthelloWithChat() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <CopilotSidebar
        labels={{
          title: 'オセロAIアシスタント',
          initial: 'こんにちは！オセロゲームのアシスタントです。「次の最適な手を教えて」や「白の石を置いて」と話しかけてください。',
        }}
        defaultOpen={true}
        clickOutsideToClose={false}
      >
        <div className="h-full w-full overflow-auto bg-gray-50">
          <OthelloGame />
        </div>
      </CopilotSidebar>
    </CopilotKit>
  );
}
