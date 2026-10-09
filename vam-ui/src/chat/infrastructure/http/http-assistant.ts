import { ApiClient } from '../../../shared/infrastructure/http/api-client.ts';
import {
  Assistant,
  type AssistantEvent,
  type AssistantModels,
  type AssistantRequest,
} from '../../application/ports/assistant.ts';
import { AssistantUnavailableError } from '../../domain/chat.errors.ts';
import {
  notFoundAsDomainError,
  toConversation,
  type ConversationResponse,
} from './http-conversation.repository.ts';

/**
 * `Assistant` backed by the VAM API: `POST /conversations/:id/messages`
 * answers with Server-Sent Events — `conversation`, `delta {text}`…, then
 * `done {}` or `error {message}`.
 */
export class HttpAssistant extends Assistant {
  constructor(private readonly api: ApiClient) {
    super();
  }

  models(): Promise<AssistantModels> {
    return this.api.get<AssistantModels>('/chat/models');
  }

  async *stream({
    conversationId,
    message,
    model,
    signal,
  }: AssistantRequest): AsyncIterable<AssistantEvent> {
    const events = this.api.stream(
      `/conversations/${encodeURIComponent(conversationId)}/messages`,
      { message, model },
      signal,
    );
    // The 404 of a deleted conversation arrives with the first read.
    const iterator = events[Symbol.asyncIterator]();
    let next = await notFoundAsDomainError(() => iterator.next());
    for (; !next.done; next = await iterator.next()) {
      const { event, data } = next.value;
      if (event === 'conversation') {
        yield { type: 'conversation', conversation: toConversation(JSON.parse(data) as ConversationResponse) };
      } else if (event === 'delta') {
        yield { type: 'delta', text: (JSON.parse(data) as { text: string }).text };
      } else if (event === 'done') {
        return;
      } else if (event === 'error') {
        throw new AssistantUnavailableError(errorMessage(data));
      }
    }
    // The connection closed without `done`: the server went away midway.
    throw new AssistantUnavailableError('The answer was cut off');
  }
}

/**
 * Our `error` events carry `{ message }`; Nest's own (a handler that failed
 * after the stream opened) carry the message as plain text.
 */
function errorMessage(data: string): string | undefined {
  try {
    const parsed: unknown = JSON.parse(data);
    if (typeof parsed === 'object' && parsed && 'message' in parsed) {
      return String(parsed.message);
    }
  } catch {
    // Plain text.
  }
  return data || undefined;
}
