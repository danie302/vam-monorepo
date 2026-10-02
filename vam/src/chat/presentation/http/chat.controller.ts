import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  type MessageEvent,
  RequestMethod,
  Sse,
  SseSignal,
  UseFilters,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { StreamReplyUseCase } from '../../application/stream-reply.use-case.ts';
import { ChatModels } from '../../domain/chat-models.ts';
import { ChatErrorFilter } from './chat-error.filter.ts';
import { sendMessageSchema, type SendMessageDto } from './dto/send-message.dto.ts';
import { toServerSentEvents } from './server-sent-events.ts';

export interface ChatModelsResponse {
  models: string[];
  default: string;
}

/** Translates HTTP to the chat use cases and back; no logic of its own. */
@Controller('chat')
@UseFilters(ChatErrorFilter)
export class ChatController {
  constructor(
    private readonly streamReplyUseCase: StreamReplyUseCase,
    private readonly models: ChatModels,
  ) {}

  /** The models a message can ask for, and the one used when it does not. */
  @Get('models')
  listModels(): ChatModelsResponse {
    return { models: [...this.models.all], default: this.models.default };
  }

  /**
   * Answers a message as Server-Sent Events (see `toServerSentEvents`). POST,
   * because the message goes in the body: read it with `fetch`, not
   * `EventSource`, which only does GET. An unknown model is a 400 before
   * the stream starts.
   */
  @Sse('messages', { method: RequestMethod.POST })
  @HttpCode(HttpStatus.OK)
  sendMessage(
    @Body({ schema: sendMessageSchema }) body: SendMessageDto,
    @SseSignal() signal: AbortSignal,
  ): Observable<MessageEvent> {
    return toServerSentEvents(this.streamReplyUseCase.execute({ ...body, signal }));
  }
}
