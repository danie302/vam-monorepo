import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { literal } from 'sequelize';
import { ChatMessage } from '../../domain/chat-message.ts';
import { Conversation } from '../../domain/conversation.ts';
import { ConversationRepository } from '../../domain/conversation.repository.ts';
import { ChatMessageModel } from './chat-message.model.ts';
import { ConversationModel } from './conversation.model.ts';

@Injectable()
export class SequelizeConversationRepository extends ConversationRepository {
  constructor(
    @InjectModel(ConversationModel)
    private readonly conversationModel: typeof ConversationModel,
    @InjectModel(ChatMessageModel)
    private readonly messageModel: typeof ChatMessageModel,
  ) {
    super();
  }

  async create(conversation: Conversation): Promise<void> {
    await this.conversationModel.create(conversation.toProps());
  }

  /** Writes the fields that change: title and updatedAt. */
  async update(conversation: Conversation): Promise<void> {
    const { id, title, updatedAt } = conversation.toProps();
    await this.conversationModel.update({ title, updatedAt }, { where: { id } });
  }

  async findForUser(id: string, userId: string): Promise<Conversation | null> {
    const row = await this.conversationModel.findOne({ where: { id, userId } });
    return row ? toConversation(row) : null;
  }

  async listForUser(userId: string): Promise<Conversation[]> {
    const rows = await this.conversationModel.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
    });
    return rows.map(toConversation);
  }

  /**
   * Deletes the messages, then the conversation, in one transaction. The
   * foreign key cascades too; deleting explicitly does not rely on it.
   */
  async deleteForUser(id: string, userId: string): Promise<boolean> {
    const sequelize = this.conversationModel.sequelize!;
    return sequelize.transaction(async (transaction) => {
      const row = await this.conversationModel.findOne({ where: { id, userId }, transaction });
      if (!row) return false;
      await this.messageModel.destroy({ where: { conversationId: id }, transaction });
      await row.destroy({ transaction });
      return true;
    });
  }

  async addMessage(message: ChatMessage): Promise<void> {
    await this.messageModel.create(message.toProps());
  }

  async listMessages(conversationId: string): Promise<ChatMessage[]> {
    const rows = await this.messageModel.findAll({
      where: { conversationId },
      // Two messages can share a millisecond: SQLite's rowid keeps them in
      // insertion order.
      order: [['createdAt', 'ASC'], [literal('rowid'), 'ASC']],
    });
    return rows.map(toMessage);
  }
}

/** Maps rows to domain entities, so the models never leave this adapter. */
function toConversation(row: ConversationModel): Conversation {
  return Conversation.restore({
    id: row.id,
    userId: row.userId,
    title: row.title,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

function toMessage(row: ChatMessageModel): ChatMessage {
  return ChatMessage.restore({
    id: row.id,
    conversationId: row.conversationId,
    role: row.role,
    content: row.content,
    model: row.model,
    createdAt: row.createdAt,
  });
}
