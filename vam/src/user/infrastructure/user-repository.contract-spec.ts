import { EmailAlreadyRegisteredError } from '../domain/email-already-registered.error.ts';
import { User } from '../domain/user.ts';
import { UserRepository } from '../domain/user.repository.ts';

/**
 * What every `UserRepository` must do, whatever database is behind it.
 * Each adapter's spec runs it: `userRepositoryContract(() => new MyRepo())`.
 */
export function userRepositoryContract(
  create: () => UserRepository | Promise<UserRepository>,
) {
  let repository: UserRepository;

  beforeEach(async () => {
    repository = await create();
  });

  const newUser = (email = 'ada@example.com') =>
    User.create({ name: 'Ada', email, passwordHash: 'hash' });

  it('finds a created user by id and by email', async () => {
    const user = newUser();
    await repository.create(user);

    expect((await repository.findById(user.id))?.toProps()).toEqual(
      user.toProps(),
    );
    expect((await repository.findByEmail(user.email))?.id).toBe(user.id);
  });

  it('answers null for unknown users', async () => {
    expect(await repository.findById(crypto.randomUUID())).toBeNull();
    expect(await repository.findByEmail('nobody@example.com')).toBeNull();
  });

  it('refuses a second user with the same email', async () => {
    await repository.create(newUser());
    await expect(repository.create(newUser())).rejects.toBeInstanceOf(
      EmailAlreadyRegisteredError,
    );
  });

  it('updates a user', async () => {
    const user = newUser();
    await repository.create(user);

    await repository.update(user.withPasswordHash('new-hash'));

    expect((await repository.findById(user.id))?.passwordHash).toBe('new-hash');
  });
}
