'use client';

import { useAuth } from '../../auth/presentation/auth-provider.tsx';
import { ChatView } from '../../chat/presentation/components/chat-view.tsx';
import { container } from '../../container.ts';

/** Home: the chat with the assistant. */
export default function ChatPage() {
  const { user } = useAuth();
  return <ChatView useCases={container.chat} userName={user?.name} />;
}
