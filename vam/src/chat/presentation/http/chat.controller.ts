import { Controller, Get } from '@nestjs/common';
import { ChatModels } from '../../domain/chat-models.ts';

export interface ChatModelsResponse {
  models: string[];
  default: string;
}

/** Chat settings the web app needs. */
@Controller('chat')
export class ChatController {
  constructor(private readonly models: ChatModels) {}

  /** The models a message can ask for, and the one used when it does not. */
  @Get('models')
  listModels(): ChatModelsResponse {
    return { models: [...this.models.all], default: this.models.default };
  }
}
