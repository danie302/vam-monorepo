'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useChat } from '../chat-provider.tsx';
import { ChatInput } from './chat-input.tsx';
import { EmptyChat } from './empty-chat.tsx';
import { MessageBubble } from './message-bubble.tsx';
import { ModelSelect } from './model-select.tsx';
import { TypingIndicator } from './typing-indicator.tsx';

/**
 * One conversation (or the new chat, with `conversationId` null): scrolling
 * messages on top, message box at the bottom. The first message of a new
 * chat starts a conversation and moves to its URL.
 */
export function ChatView({
  conversationId,
  userName,
}: {
  conversationId: string | null;
  userName?: string;
}) {
  const chat = useChat();
  const router = useRouter();
  const { messages, status, error } = chat.thread(conversationId);
  const busy = status === 'waiting' || status === 'streaming';
  const scrollRef = useRef<HTMLDivElement>(null);
  // Follow the answer as it grows, unless the user scrolled up to read.
  const followRef = useRef(true);
  const { open } = chat;

  useEffect(() => {
    if (conversationId) open(conversationId);
  }, [conversationId, open]);

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

  const send = (text: string) =>
    chat.send(conversationId, text, (startedId) => router.replace(`/c/${startedId}`));

  if (status === 'missing') {
    return (
      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', p: 3, textAlign: 'center' }}>
        <Box>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 700 }}>
            Conversation not found
          </Typography>
          <Typography sx={{ color: 'text.secondary', mt: 0.5, mb: 2 }}>
            It may have been deleted.
          </Typography>
          <Button variant="contained" onClick={() => router.push('/')}>
            Start a new chat
          </Button>
        </Box>
      </Box>
    );
  }

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
          {status === 'loading' ? (
            <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}>
              <CircularProgress aria-label="Loading conversation" />
            </Box>
          ) : messages.length === 0 && !busy ? (
            <EmptyChat userName={userName} onSuggestion={(text) => void send(text)} />
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
          <Alert
            severity="error"
            onClose={() => chat.dismissError(conversationId)}
            sx={{ mb: 1.5 }}
          >
            {error}
          </Alert>
        )}
        <ChatInput
          onSend={send}
          onStop={() => chat.stop(conversationId)}
          busy={busy || status === 'loading'}
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
