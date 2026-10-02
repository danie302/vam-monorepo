import { Injectable } from '@nestjs/common';
import { PasswordHasher as LibraryPasswordHasher } from '@nestjs/authentication';
import { PasswordHasher } from '../../application/ports/password-hasher.ts';

/** `PasswordHasher` on `@nestjs/authentication`'s scrypt hasher. */
@Injectable()
export class ScryptPasswordHasher extends PasswordHasher {
  constructor(private readonly hasher: LibraryPasswordHasher) {
    super();
  }

  /** Hashes with scrypt; the parameters are stored inside the hash. */
  hash(password: string): Promise<string> {
    return this.hasher.hash(password);
  }

  /** Constant-time check; `undefined` checks a dummy hash. */
  verify(password: string, hash: string | undefined): Promise<boolean> {
    return this.hasher.verify(password, hash);
  }

  /** Whether the hash uses older scrypt parameters than the configured ones. */
  needsRehash(hash: string): boolean {
    return this.hasher.needsRehash(hash);
  }
}
