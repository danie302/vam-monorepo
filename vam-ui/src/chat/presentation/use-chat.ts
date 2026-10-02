'use client';

import { useState } from 'react';
import type { SendMessageUseCase } from '../application/send-message.use-case.ts';
import { createMessage, type Message } from '../domain/message.ts';

/**
 * Conversation state for one page visit: the user's message shows up at
 * once, the answer when it arrives. Nothing is stored (no memory yet).
 */
export function useChat(sendMessage: SendMessageUseCase) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Sends `content`; returns false when there was nothing to send. */
  async function send(content: string): Promise<boolean> {
    if (pending || !content.trim()) return false;
    setMessages((current) => [...current, createMessage('user', content)]);
    setPending(true);
    setError(null);
    try {
      const answer = await sendMessage.execute(content);
      setMessages((current) => [...current, answer]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setPending(false);
    }
    return true;
  }

  return { messages, pending, error, send, dismissError: () => setError(null) };
}
