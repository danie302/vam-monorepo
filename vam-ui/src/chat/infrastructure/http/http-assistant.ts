import { ApiClient } from '../../../shared/infrastructure/http/api-client.ts';
import {
  Assistant,
  type AssistantModels,
  type AssistantRequest,
} from '../../application/ports/assistant.ts';
import { AssistantUnavailableError } from '../../domain/chat.errors.ts';

/**
 * `Assistant` backed by the VAM API: `POST /chat/messages` answers with
 * Server-Sent Events — `delta {text}`, then `done {}` or `error {message}`.
 */
export class HttpAssistant extends Assistant {
  constructor(private readonly api: ApiClient) {
    super();
  }

  models(): Promise<AssistantModels> {
    return this.api.get<AssistantModels>('/chat/models');
  }

  async *stream({ message, model, signal }: AssistantRequest): AsyncIterable<string> {
    const events = this.api.stream('/chat/messages', { message, model }, signal);
    for await (const { event, data } of events) {
      if (event === 'delta') {
        yield (JSON.parse(data) as { text: string }).text;
      } else if (event === 'done') {
        return;
      } else if (event === 'error') {
        throw new AssistantUnavailableError((JSON.parse(data) as { message: string }).message);
      }
    }
    // The connection closed without `done`: the server went away midway.
    throw new AssistantUnavailableError('The answer was cut off');
  }
}
