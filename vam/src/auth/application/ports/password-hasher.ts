/** Port: one-way password hashing. */
export abstract class PasswordHasher {
  /** Hashes a password for storage. */
  abstract hash(password: string): Promise<string>;

  /**
   * Whether `password` matches `hash`. With `undefined` (an unknown user),
   * it must still take as long as a real check, and answer `false`.
   */
  abstract verify(password: string, hash: string | undefined): Promise<boolean>;

  /** Whether `hash` was made with weaker settings than the current ones. */
  abstract needsRehash(hash: string): boolean;
}
