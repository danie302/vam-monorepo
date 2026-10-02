import { Sequelize } from 'sequelize-typescript';
import { userRepositoryContract } from '../user-repository.contract-spec.ts';
import { SequelizeUserRepository } from './sequelize-user.repository.ts';
import { UserModel } from './user.model.ts';

describe('SequelizeUserRepository', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [UserModel],
      logging: false,
    });
    await sequelize.sync();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  userRepositoryContract(async () => {
    await UserModel.truncate();
    return new SequelizeUserRepository(UserModel);
  });
});
