import { User } from '../../domain/user.ts';

/** What the API shows of a user: never the password hash. */
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

/** Maps a user to the shape the API returns. */
export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}
