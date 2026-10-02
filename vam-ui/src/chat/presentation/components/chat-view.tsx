'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useEffect, useRef } from 'react';
import type { ChatUseCases } from '../../chat.module.ts';
import { useChat } from '../use-chat.ts';
import { ChatInput } from './chat-input.tsx';
import { EmptyChat } from './empty-chat.tsx';
import { MessageBubble } from './message-bubble.tsx';
import { ModelSelect } from './model-select.tsx';
import { TypingIndicator } from './typing-indicator.tsx';

/** The whole chat: scrolling message list on top, message box at the bottom. */
export function ChatView({
  useCases,
  userName,
}: {
  useCases: ChatUseCases;
  userName?: string;
}) {
  const chat = useChat(useCases);
  const { messages, status, error } = chat;
  const busy = status !== 'idle';
  const scrollRef = useRef<HTMLDivElement>(null);
  // Follow the answer as it grows, unless the user scrolled up to read.
  const followRef = useRef(true);

  function onScroll() {
    const list = scrollRef.current;
    if (!list) return;
    followRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
  }

  // A new message (the user's, or the answer's first chunk) always scrolls.
  useEffect(() => {
    followRef.current = true;
  }, [messages.length]);

  useEffect(() => {
    const list = scrollRef.current;
    if (!list || !followRef.current) return;
    // Instant while streaming: smooth scrolling on every chunk would lag.
    list.scrollTo({
      top: list.scrollHeight,
      behavior: status === 'streaming' ? 'auto' : 'smooth',
    });
  }, [messages, status]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box ref={scrollRef} onScroll={onScroll} sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
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
          {messages.length === 0 && !busy ? (
            <EmptyChat userName={userName} onSuggestion={(text) => void chat.send(text)} />
          ) : (
            <Stack spacing={2.5} role="log" aria-live="polite" aria-label="Conversation">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {status === 'waiting' && <TypingIndicator />}
            </Stack>
          )}
        </Box>
      </Box>
      <Box sx={{ maxWidth: 800, width: '100%', mx: 'auto', px: 2, pb: 2, pt: 1 }}>
        {error && (
          <Alert severity="error" onClose={chat.dismissError} sx={{ mb: 1.5 }}>
            {error}
          </Alert>
        )}
        <ChatInput
          onSend={chat.send}
          onStop={chat.stop}
          busy={busy}
          footer={
            <ModelSelect
              models={chat.models}
              value={chat.model}
              onChange={chat.setModel}
              disabled={busy}
            />
          }
        />
      </Box>
    </Box>
  );
}
