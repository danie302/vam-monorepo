import { createAuthModule } from './auth/auth.module.ts';
import type { AuthRepository } from './auth/domain/auth.repository.ts';
import { HttpAuthRepository } from './auth/infrastructure/http/http-auth.repository.ts';
import { InMemoryAuthRepository } from './auth/infrastructure/in-memory/in-memory-auth.repository.ts';
import { createChatModule } from './chat/chat.module.ts';
import { PlaceholderAssistant } from './chat/infrastructure/placeholder/placeholder-assistant.ts';
import { ApiClient } from './shared/infrastructure/http/api-client.ts';

/** Composition root: the only place that picks adapters. */
const api = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
);

/**
 * `NEXT_PUBLIC_AUTH_ADAPTER`: `http` (default) talks to the API, `memory`
 * keeps accounts in the browser tab (lost on reload) to work on the UI
 * without the backend. Read as a literal: Next inlines it at build time.
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

export const container = {
  auth: createAuthModule(authRepository()),
  // No LLM endpoint in the API yet: swap for an HTTP adapter once there is.
  chat: createChatModule(new PlaceholderAssistant()),
};

export type Container = typeof container;
