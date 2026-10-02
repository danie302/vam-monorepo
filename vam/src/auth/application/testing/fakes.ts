import { PasswordHasher } from '../ports/password-hasher.ts';
import { SessionManager } from '../ports/session-manager.ts';

/** Reversible "hash" with a version, so tests can trigger `needsRehash()`. */
export class FakePasswordHasher extends PasswordHasher {
  version = 'v2';

  async hash(password: string): Promise<string> {
    return `${this.version}:${password}`;
  }

  async verify(password: string, hash: string | undefined): Promise<boolean> {
    return (
      hash !== undefined && hash.split(':').slice(1).join(':') === password
    );
  }

  needsRehash(hash: string): boolean {
    return !hash.startsWith(`${this.version}:`);
  }
}

export class FakeSessionManager extends SessionManager {
  current: string | null = null;

  async start(userId: string): Promise<void> {
    this.current = userId;
  }

  async end(): Promise<void> {
    this.current = null;
  }
}
