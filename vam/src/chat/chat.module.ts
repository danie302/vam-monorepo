import { Module } from '@nestjs/common';
import OpenAI from 'openai';
import { chatInstructions, chatModels, openAiApiKey } from '../config/chat.config.ts';
import { CheckConversationAccessUseCase } from './application/check-conversation-access.use-case.ts';
import { DeleteConversationUseCase } from './application/delete-conversation.use-case.ts';
import { GetConversationUseCase } from './application/get-conversation.use-case.ts';
import { ListConversationsUseCase } from './application/list-conversations.use-case.ts';
import { LanguageModel } from './application/ports/language-model.ts';
import { SendMessageUseCase } from './application/send-message.use-case.ts';
import { StartConversationUseCase } from './application/start-conversation.use-case.ts';
import { ChatInstructions } from './domain/chat-instructions.ts';
import { ChatModels } from './domain/chat-models.ts';
import { ConversationRepository } from './domain/conversation.repository.ts';
import { OpenAiLanguageModel } from './infrastructure/openai/openai-language-model.ts';
import { ChatController } from './presentation/http/chat.controller.ts';
import { ConversationAccessGuard } from './presentation/http/conversation-access.guard.ts';
import { ConversationsController } from './presentation/http/conversations.controller.ts';

/** Use cases that only need the conversation repository. */
const conversationUseCases = [
  ListConversationsUseCase,
  StartConversationUseCase,
  GetConversationUseCase,
  DeleteConversationUseCase,
  CheckConversationAccessUseCase,
].map((UseCase) => ({
  provide: UseCase,
  useFactory: (conversations: ConversationRepository) => new UseCase(conversations),
  inject: [ConversationRepository],
}));

@Module({
  controllers: [ChatController, ConversationsController],
  providers: [
    { provide: ChatModels, useFactory: () => ChatModels.of(chatModels) },
    {
      provide: ChatInstructions,
      useFactory: () => ChatInstructions.of(chatInstructions),
    },

    // Port → adapter. Fails at startup without OPENAI_API_KEY.
    // `ConversationRepository` comes from the global `DatabaseModule`.
    {
      provide: LanguageModel,
      useFactory: () =>
        new OpenAiLanguageModel(new OpenAI({ apiKey: openAiApiKey() })),
    },

    // The use cases are plain classes: wired here, not decorated.
    ...conversationUseCases,
    ConversationAccessGuard,
    {
      provide: SendMessageUseCase,
      useFactory: (
        conversations: ConversationRepository,
        languageModel: LanguageModel,
        models: ChatModels,
        instructions: ChatInstructions,
      ) =>
        new SendMessageUseCase(conversations, languageModel, models, instructions),
      inject: [ConversationRepository, LanguageModel, ChatModels, ChatInstructions],
    },
  ],
})
export class ChatModule {}
