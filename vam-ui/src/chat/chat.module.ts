import { ListModelsUseCase } from './application/list-models.use-case.ts';
import { Assistant } from './application/ports/assistant.ts';
import { SendMessageUseCase } from './application/send-message.use-case.ts';

/** The chat use cases, as the presentation layer receives them. */
export interface ChatUseCases {
  sendMessage: SendMessageUseCase;
  listModels: ListModelsUseCase;
}

/** Wires the chat use cases to an assistant: `container.ts` picks which. */
export function createChatModule(assistant: Assistant): ChatUseCases {
  return {
    sendMessage: new SendMessageUseCase(assistant),
    listModels: new ListModelsUseCase(assistant),
  };
}
