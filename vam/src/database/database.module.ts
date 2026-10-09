import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthSessionModel } from '../auth/infrastructure/sequelize/auth-session.model.ts';
import { SequelizeSessionStore } from '../auth/infrastructure/sequelize/sequelize-session.store.ts';
import { ConversationRepository } from '../chat/domain/conversation.repository.ts';
import { ChatMessageModel } from '../chat/infrastructure/sequelize/chat-message.model.ts';
import { ConversationModel } from '../chat/infrastructure/sequelize/conversation.model.ts';
import { SequelizeConversationRepository } from '../chat/infrastructure/sequelize/sequelize-conversation.repository.ts';
import { UserRepository } from '../user/domain/user.repository.ts';
import { SequelizeUserRepository } from '../user/infrastructure/sequelize/sequelize-user.repository.ts';
import { UserModel } from '../user/infrastructure/sequelize/user.model.ts';
import { dataBaseConfig } from './database.config.ts';

/**
 * The one place that picks the database: it binds every repository port to
 * its Sequelize adapter. Moving to another database (or ORM) means writing
 * the adapters and a module like this one exporting the same ports; the
 * domain, the use cases and the controllers stay as they are.
 */
@Global()
@Module({
  imports: [
    SequelizeModule.forRoot(dataBaseConfig),
    SequelizeModule.forFeature([
      UserModel,
      AuthSessionModel,
      ConversationModel,
      ChatMessageModel,
    ]),
  ],
  providers: [
    { provide: UserRepository, useClass: SequelizeUserRepository },
    {
      provide: ConversationRepository,
      useClass: SequelizeConversationRepository,
    },
    // Registers itself with `AuthenticationStorage` as the session store.
    SequelizeSessionStore,
  ],
  exports: [UserRepository, ConversationRepository],
})
export class DatabaseModule {}
