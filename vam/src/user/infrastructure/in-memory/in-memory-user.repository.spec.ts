import { userRepositoryContract } from '../user-repository.contract-spec.ts';
import { InMemoryUserRepository } from './in-memory-user.repository.ts';

describe('InMemoryUserRepository', () => {
  userRepositoryContract(() => new InMemoryUserRepository());
});
