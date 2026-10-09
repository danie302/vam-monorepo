'use client';

import { useAuth } from '../../auth/presentation/auth-provider.tsx';
import { ChatView } from '../../chat/presentation/components/chat-view.tsx';

/** A new chat: its first message starts a conversation. */
export default function NewChatPage() {
  const { user } = useAuth();
  return <ChatView conversationId={null} userName={user?.name} />;
}
