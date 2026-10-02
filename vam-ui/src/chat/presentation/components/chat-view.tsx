'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useEffect, useRef } from 'react';
import type { SendMessageUseCase } from '../../application/send-message.use-case.ts';
import { useChat } from '../use-chat.ts';
import { ChatInput } from './chat-input.tsx';
import { EmptyChat } from './empty-chat.tsx';
import { MessageBubble } from './message-bubble.tsx';
import { TypingIndicator } from './typing-indicator.tsx';

/** The whole chat: scrolling message list on top, message box at the bottom. */
export function ChatView({
  sendMessage,
  userName,
}: {
  sendMessage: SendMessageUseCase;
  userName?: string;
}) {
  const { messages, pending, error, send, dismissError } = useChat(sendMessage);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest message (or the typing dots) in view.
  useEffect(() => {
    const list = scrollRef.current;
    list?.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [messages.length, pending]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box ref={scrollRef} sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Box
          sx={{
            maxWidth: 800,
            mx: 'auto',
            px: 2,
            py: 3,
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {messages.length === 0 && !pending ? (
            <EmptyChat userName={userName} onSuggestion={(text) => void send(text)} />
          ) : (
            <Stack spacing={2.5} role="log" aria-live="polite" aria-label="Conversation">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {pending && <TypingIndicator />}
            </Stack>
          )}
        </Box>
      </Box>
      <Box sx={{ maxWidth: 800, width: '100%', mx: 'auto', px: 2, pb: 2, pt: 1 }}>
        {error && (
          <Alert severity="error" onClose={dismissError} sx={{ mb: 1.5 }}>
            {error}
          </Alert>
        )}
        <ChatInput onSend={send} disabled={pending} />
      </Box>
    </Box>
  );
}
