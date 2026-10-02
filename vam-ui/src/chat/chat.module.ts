import { Assistant } from './application/ports/assistant.ts';
import { SendMessageUseCase } from './application/send-message.use-case.ts';

/** The chat use cases, as the presentation layer receives them. */
export interface ChatUseCases {
  sendMessage: SendMessageUseCase;
}

/** Wires the chat use cases to an assistant: `container.ts` picks which. */
export function createChatModule(assistant: Assistant): ChatUseCases {
  return { sendMessage: new SendMessageUseCase(assistant) };
}
