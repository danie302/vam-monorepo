import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  type MessageEvent,
  Param,
  ParseUUIDPipe,
  Post,
  RequestMethod,
  Sse,
  SseSignal,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import { Observable } from 'rxjs';
import { User } from '../../../user/domain/user.ts';
import { DeleteConversationUseCase } from '../../application/delete-conversation.use-case.ts';
import { GetConversationUseCase } from '../../application/get-conversation.use-case.ts';
import { ListConversationsUseCase } from '../../application/list-conversations.use-case.ts';
import { SendMessageUseCase } from '../../application/send-message.use-case.ts';
import { StartConversationUseCase } from '../../application/start-conversation.use-case.ts';
import { ChatErrorFilter } from './chat-error.filter.ts';
import { ConversationAccessGuard } from './conversation-access.guard.ts';
import {
  toChatMessageResponse,
  toConversationResponse,
  type ConversationResponse,
  type ConversationWithMessagesResponse,
} from './conversation.response.ts';
import { sendMessageSchema, type SendMessageDto } from './dto/send-message.dto.ts';
import { toServerSentEvents } from './server-sent-events.ts';

/**
 * The signed-in user's conversations. Translates HTTP to the use cases and
 * back; another user's conversation is a 404, like a missing one.
 */
@Controller('conversations')
@UseFilters(ChatErrorFilter)
export class ConversationsController {
  constructor(
    private readonly listConversations: ListConversationsUseCase,
    private readonly startConversation: StartConversationUseCase,
    private readonly getConversation: GetConversationUseCase,
    private readonly deleteConversation: DeleteConversationUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
  ) {}

  /** Most recently active first. */
  @Get()
  async list(@CurrentUser() user: User): Promise<ConversationResponse[]> {
    return (await this.listConversations.execute(user.id)).map(toConversationResponse);
  }

  /** An empty, untitled conversation: its first message names it. */
  @Post()
  async start(@CurrentUser() user: User): Promise<ConversationResponse> {
    return toConversationResponse(await this.startConversation.execute(user.id));
  }

  /** The conversation with its messages, oldest first. */
  @Get(':id')
  async get(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ConversationWithMessagesResponse> {
    const { conversation, messages } = await this.getConversation.execute(user.id, id);
    return {
      ...toConversationResponse(conversation),
      messages: messages.map(toChatMessageResponse),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteConversation.execute(user.id, id);
  }

  /**
   * Saves the message and streams the answer as Server-Sent Events (see
   * `toServerSentEvents`), opening with `conversation`: the conversation
   * with its new title and activity date. POST, because the message goes in
   * the body: read it with `fetch`, not `EventSource`. An unknown model or
   * conversation is a 400 / 404 before the stream starts (the conversation
   * is checked by `ConversationAccessGuard`: see why there).
   */
  @Sse(':id/messages', { method: RequestMethod.POST })
  @HttpCode(HttpStatus.OK)
  @UseGuards(ConversationAccessGuard)
  async sendMessage(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body({ schema: sendMessageSchema }) body: SendMessageDto,
    @SseSignal() signal: AbortSignal,
  ): Promise<Observable<MessageEvent>> {
    const { conversation, answer } = await this.sendMessageUseCase.execute({
      userId: user.id,
      conversationId: id,
      ...body,
      signal,
    });
    return toServerSentEvents(answer, [
      { type: 'conversation', data: toConversationResponse(conversation) },
    ]);
  }
}
