import { recentHistory } from '../domain/chat-history.ts';
import { ChatInstructions } from '../domain/chat-instructions.ts';
import { ChatModels } from '../domain/chat-models.ts';
import { ChatMessage } from '../domain/chat-message.ts';
import { Conversation } from '../domain/conversation.ts';
import { ConversationNotFoundError } from '../domain/conversation-not-found.error.ts';
import { ConversationRepository } from '../domain/conversation.repository.ts';
import { UnsupportedModelError } from '../domain/unsupported-model.error.ts';
import { LanguageModel } from './ports/language-model.ts';

export interface SendMessageCommand {
  userId: string;
  conversationId: string;
  message: string;
  /** One of the chat models; the default one when missing. */
  model?: string;
  /** Aborted when the client leaves: the model stops. */
  signal?: AbortSignal;
}

export interface SendMessageResult {
  /** The conversation after the user's message (title, updatedAt). */
  conversation: Conversation;
  /** The answer, chunk by chunk. Saved when it ends, however it ends. */
  answer: AsyncIterable<string>;
}

/**
 * Saves the user's message and streams the model's answer to the
 * conversation so far (its most recent part: see `recentHistory`). The
 * answer is saved when the stream ends: complete, stopped, or failed midway
 * (what arrived is kept, as the user saw it, and is history from then on).
 */
export class SendMessageUseCase {
  constructor(
    private readonly conversations: ConversationRepository,
    private readonly languageModel: LanguageModel,
    private readonly models: ChatModels,
    private readonly instructions: ChatInstructions,
  ) {}

  /**
   * Throws `UnsupportedModelError` or `ConversationNotFoundError` before
   * anything is saved or sent to the model.
   */
  async execute({
    userId,
    conversationId,
    message,
    model,
    signal,
  }: SendMessageCommand): Promise<SendMessageResult> {
    const chosen = model ?? this.models.default;
    if (!this.models.supports(chosen)) throw new UnsupportedModelError(chosen);

    const found = await this.conversations.findForUser(conversationId, userId);
    if (!found) throw new ConversationNotFoundError(conversationId);

    await this.conversations.addMessage(ChatMessage.fromUser(conversationId, message));
    const conversation = found.withMessage(message);
    await this.conversations.update(conversation);

    // Read back after saving: the new message is the last of the history.
    const history = recentHistory(await this.conversations.listMessages(conversationId));
    return {
      conversation,
      answer: this.answer(conversation, history, chosen, signal),
    };
  }

  private async *answer(
    conversation: Conversation,
    history: ChatMessage[],
    model: string,
    signal?: AbortSignal,
  ): AsyncIterable<string> {
    const messages = history.map(({ role, content }) => ({ role, content }));
    let text = '';
    try {
      const instructions = this.instructions.text;
      for await (const chunk of this.languageModel.stream({ model, instructions, messages, signal })) {
        text += chunk;
        yield chunk;
      }
    } finally {
      if (text) {
        await this.conversations.addMessage(
          ChatMessage.fromAssistant(conversation.id, text, model),
        );
        await this.conversations.update(conversation.touched());
      }
    }
  }
}
