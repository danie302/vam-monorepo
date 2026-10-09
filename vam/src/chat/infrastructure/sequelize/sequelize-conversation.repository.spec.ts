import { Sequelize } from 'sequelize-typescript';
import { User } from '../../../user/domain/user.ts';
import { UserModel } from '../../../user/infrastructure/sequelize/user.model.ts';
import { Conversation } from '../../domain/conversation.ts';
import { conversationRepositoryContract } from '../conversation-repository.contract-spec.ts';
import { ChatMessageModel } from './chat-message.model.ts';
import { ConversationModel } from './conversation.model.ts';
import { SequelizeConversationRepository } from './sequelize-conversation.repository.ts';

describe('SequelizeConversationRepository', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [UserModel, ConversationModel, ChatMessageModel],
      logging: false,
    });
    await sequelize.sync();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  conversationRepositoryContract(async () => {
    await ChatMessageModel.destroy({ where: {} });
    await ConversationModel.destroy({ where: {} });
    await UserModel.destroy({ where: {} });
    // Real users: the foreign keys are enforced.
    const users = ['ada', 'bob'].map((name) =>
      User.create({ name, email: `${name}@example.com`, passwordHash: 'hash' }),
    );
    await UserModel.bulkCreate(users.map((user) => user.toProps()));
    return {
      repository: new SequelizeConversationRepository(ConversationModel, ChatMessageModel),
      users: [users[0].id, users[1].id],
    };
  });

  it('enforces that the owner exists', async () => {
    const repository = new SequelizeConversationRepository(ConversationModel, ChatMessageModel);
    await expect(repository.create(Conversation.create(crypto.randomUUID()))).rejects.toThrow();
  });
});
