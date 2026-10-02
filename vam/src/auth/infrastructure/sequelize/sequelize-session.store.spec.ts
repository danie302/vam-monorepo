import { AuthenticationStorage } from '@nestjs/authentication';
import { authenticationStoreContract } from '@nestjs/authentication/testing';
import { Sequelize } from 'sequelize-typescript';
import { AuthSessionModel } from './auth-session.model.ts';
import { SequelizeSessionStore } from './sequelize-session.store.ts';

describe('SequelizeSessionStore', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [AuthSessionModel],
      logging: false,
    });
    await sequelize.sync();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  const cases = authenticationStoreContract(
    async () => {
      await AuthSessionModel.truncate();
      return {
        sessions: new SequelizeSessionStore(
          AuthSessionModel,
          new AuthenticationStorage(),
        ),
      };
    },
    { contracts: ['sessions'], concurrent: true },
  );

  it.each(cases.map((c) => [c.name, c] as const))('%s', async (_, c) => {
    await c.run();
  });
});
