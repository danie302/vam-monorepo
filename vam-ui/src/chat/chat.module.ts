import {
  DeleteConversationUseCase,
  GetConversationUseCase,
  ListConversationsUseCase,
} from './application/conversation-use-cases.ts';
import { ListModelsUseCase } from './application/list-models.use-case.ts';
import { Assistant } from './application/ports/assistant.ts';
import { SendMessageUseCase } from './application/send-message.use-case.ts';
import { ConversationRepository } from './domain/conversation.repository.ts';

/** The chat use cases, as the presentation layer receives them. */
export interface ChatUseCases {
  sendMessage: SendMessageUseCase;
  listModels: ListModelsUseCase;
  listConversations: ListConversationsUseCase;
  getConversation: GetConversationUseCase;
  deleteConversation: DeleteConversationUseCase;
}

/** Wires the chat use cases to adapters: `container.ts` picks which. */
export function createChatModule(
  conversations: ConversationRepository,
  assistant: Assistant,
): ChatUseCases {
  return {
    sendMessage: new SendMessageUseCase(conversations, assistant),
    listModels: new ListModelsUseCase(assistant),
    listConversations: new ListConversationsUseCase(conversations),
    getConversation: new GetConversationUseCase(conversations),
    deleteConversation: new DeleteConversationUseCase(conversations),
  };
}
