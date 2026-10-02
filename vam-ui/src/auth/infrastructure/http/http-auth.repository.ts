import { ApiClient, ApiError } from '../../../shared/infrastructure/http/api-client.ts';
import { AuthRepository } from '../../domain/auth.repository.ts';
import {
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
} from '../../domain/auth.errors.ts';
import type {
  SignInCredentials,
  SignUpCredentials,
} from '../../domain/credentials.ts';
import type { User } from '../../domain/user.ts';

/** What `/auth/*` returns: `createdAt` arrives as an ISO string. */
interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

/** `AuthRepository` backed by the VAM API's cookie sessions. */
export class HttpAuthRepository extends AuthRepository {
  constructor(private readonly api: ApiClient) {
    super();
  }

  async signUp(credentials: SignUpCredentials): Promise<User> {
    try {
      return toUser(await this.api.post<UserResponse>('/auth/sign-up', credentials));
    } catch (error) {
      if (isStatus(error, 409)) throw new EmailAlreadyRegisteredError();
      throw error;
    }
  }

  async signIn(credentials: SignInCredentials): Promise<User> {
    try {
      return toUser(await this.api.post<UserResponse>('/auth/sign-in', credentials));
    } catch (error) {
      if (isStatus(error, 401)) throw new InvalidCredentialsError();
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await this.api.post<void>('/auth/sign-out');
  }

  async currentUser(): Promise<User | null> {
    try {
      return toUser(await this.api.get<UserResponse>('/auth/me'));
    } catch (error) {
      if (isStatus(error, 401) || isStatus(error, 403)) return null;
      throw error;
    }
  }
}

function toUser(response: UserResponse): User {
  return { ...response, createdAt: new Date(response.createdAt) };
}

function isStatus(error: unknown, status: number): boolean {
  return error instanceof ApiError && error.status === status;
}
