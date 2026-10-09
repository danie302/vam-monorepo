import { createAuthModule } from './auth/auth.module.ts';
import type { AuthRepository } from './auth/domain/auth.repository.ts';
import { HttpAuthRepository } from './auth/infrastructure/http/http-auth.repository.ts';
import { InMemoryAuthRepository } from './auth/infrastructure/in-memory/in-memory-auth.repository.ts';
import { createChatModule, type ChatUseCases } from './chat/chat.module.ts';
import { HttpAssistant } from './chat/infrastructure/http/http-assistant.ts';
import { HttpConversationRepository } from './chat/infrastructure/http/http-conversation.repository.ts';
import { InMemoryConversationRepository } from './chat/infrastructure/in-memory/in-memory-conversation.repository.ts';
import { PlaceholderAssistant } from './chat/infrastructure/placeholder/placeholder-assistant.ts';
import { ApiClient } from './shared/infrastructure/http/api-client.ts';

/**
 * Composition root: the only place that picks adapters. `NEXT_PUBLIC_*`
 * variables are read as literals: Next inlines them at build time.
 */
const api = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
);

/**
 * `NEXT_PUBLIC_AUTH_ADAPTER`: `http` (default) talks to the API, `memory`
 * keeps accounts in the browser tab (lost on reload) to work on the UI
 * without the backend.
 */
function authRepository(): AuthRepository {
  const adapter = process.env.NEXT_PUBLIC_AUTH_ADAPTER ?? 'http';
  switch (adapter) {
    case 'http':
      return new HttpAuthRepository(api);
    case 'memory':
      return new InMemoryAuthRepository();
    default:
      throw new Error(
        `Unknown NEXT_PUBLIC_AUTH_ADAPTER "${adapter}": use "http" or "memory"`,
      );
  }
}

/**
 * `NEXT_PUBLIC_CHAT_ADAPTER`: `http` (default) streams answers from the
 * API's LLM and keeps conversations there; `placeholder` streams a canned
 * answer and keeps conversations in the tab (no API or OpenAI key).
 */
function chat(): ChatUseCases {
  const adapter = process.env.NEXT_PUBLIC_CHAT_ADAPTER ?? 'http';
  switch (adapter) {
    case 'http':
      return createChatModule(new HttpConversationRepository(api), new HttpAssistant(api));
    case 'placeholder': {
      const conversations = new InMemoryConversationRepository();
      return createChatModule(conversations, new PlaceholderAssistant(conversations));
    }
    default:
      throw new Error(
        `Unknown NEXT_PUBLIC_CHAT_ADAPTER "${adapter}": use "http" or "placeholder"`,
      );
  }
}

export const container = {
  auth: createAuthModule(authRepository()),
  chat: chat(),
};

export type Container = typeof container;
