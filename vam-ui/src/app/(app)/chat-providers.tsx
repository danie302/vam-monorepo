'use client';

import type { ReactNode } from 'react';
import { ChatProvider } from '../../chat/presentation/chat-provider.tsx';
import { container } from '../../container.ts';

/** Gives the signed-in pages the chat state, wired to the container's use cases. */
export function ChatProviders({ children }: { children: ReactNode }) {
  return <ChatProvider useCases={container.chat}>{children}</ChatProvider>;
}
