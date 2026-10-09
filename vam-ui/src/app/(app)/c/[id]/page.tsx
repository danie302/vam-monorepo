'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '../../../../auth/presentation/auth-provider.tsx';
import { ChatView } from '../../../../chat/presentation/components/chat-view.tsx';

/** An existing conversation. */
export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  return <ChatView key={id} conversationId={id} userName={user?.name} />;
}
