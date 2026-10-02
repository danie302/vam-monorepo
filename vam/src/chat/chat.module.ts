import { Module } from '@nestjs/common';
import OpenAI from 'openai';
import { chatModels, openAiApiKey } from '../config/chat.config.ts';
import { LanguageModel } from './application/ports/language-model.ts';
import { StreamReplyUseCase } from './application/stream-reply.use-case.ts';
import { ChatModels } from './domain/chat-models.ts';
import { OpenAiLanguageModel } from './infrastructure/openai/openai-language-model.ts';
import { ChatController } from './presentation/http/chat.controller.ts';

@Module({
  controllers: [ChatController],
  providers: [
    { provide: ChatModels, useFactory: () => ChatModels.of(chatModels) },

    // Port → adapter. Fails at startup without OPENAI_API_KEY.
    {
      provide: LanguageModel,
      useFactory: () =>
        new OpenAiLanguageModel(new OpenAI({ apiKey: openAiApiKey() })),
    },

    // The use cases are plain classes: wired here, not decorated.
    {
      provide: StreamReplyUseCase,
      useFactory: (languageModel: LanguageModel, models: ChatModels) =>
        new StreamReplyUseCase(languageModel, models),
      inject: [LanguageModel, ChatModels],
    },
  ],
})
export class ChatModule {}
