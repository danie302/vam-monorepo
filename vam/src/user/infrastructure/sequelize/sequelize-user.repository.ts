import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UniqueConstraintError } from 'sequelize';
import { EmailAlreadyRegisteredError } from '../../domain/email-already-registered.error.ts';
import { User } from '../../domain/user.ts';
import { UserRepository } from '../../domain/user.repository.ts';
import { UserModel } from './user.model.ts';

@Injectable()
export class SequelizeUserRepository extends UserRepository {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
  ) {
    super();
  }

  /** Inserts the user; a duplicate email becomes `EmailAlreadyRegisteredError`. */
  async create(user: User): Promise<void> {
    try {
      await this.userModel.create(user.toProps());
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new EmailAlreadyRegisteredError(user.email);
      }
      throw error;
    }
  }

  /** Writes every field of the user but its id. */
  async update(user: User): Promise<void> {
    const { id, ...changes } = user.toProps();
    await this.userModel.update(changes, { where: { id } });
  }

  /** Loads a user by primary key. */
  async findById(id: string): Promise<User | null> {
    const row = await this.userModel.findByPk(id);
    return row ? toDomain(row) : null;
  }

  /** Loads a user by email (unique column). */
  async findByEmail(email: string): Promise<User | null> {
    const row = await this.userModel.findOne({ where: { email } });
    return row ? toDomain(row) : null;
  }
}

/** Maps a Sequelize row to the domain entity, so `UserModel` never leaves this adapter. */
function toDomain(row: UserModel): User {
  return User.restore({
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}
