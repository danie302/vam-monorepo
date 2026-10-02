export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewUser {
  name: string;
  email: string;
  passwordHash: string;
}

/**
 * A registered user. Plain TypeScript: no ORM or framework, so any
 * `UserRepository` can store it. The id is generated here, not by the
 * database, so it means the same thing whatever stores it.
 */
export class User {
  private constructor(private readonly props: UserProps) {}

  /** Creates a new user: generates its id and normalizes name and email. */
  static create({ name, email, passwordHash }: NewUser, now = new Date()) {
    return new User({
      id: crypto.randomUUID(),
      name: name.trim(),
      email: User.normalizeEmail(email),
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Rebuilds a user a repository loaded. */
  static restore(props: UserProps): User {
    return new User({ ...props });
  }

  /** Emails are compared trimmed and lowercased. */
  static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /** Read-only access to the user's data: change it through methods like `withPasswordHash()`. */
  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /** Returns a copy of the user with a new password hash (entities are immutable). */
  withPasswordHash(passwordHash: string, now = new Date()): User {
    return new User({ ...this.props, passwordHash, updatedAt: now });
  }

  /** The user as plain data, for repositories to store. */
  toProps(): UserProps {
    return { ...this.props };
  }
}
