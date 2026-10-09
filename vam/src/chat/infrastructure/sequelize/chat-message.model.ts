import { Column, DataType, Model, Table } from 'sequelize-typescript';
import type { ChatMessageProps, ChatRole } from '../../domain/chat-message.ts';

/** Sequelize's view of a message. Never leaves this folder. */
@Table({
  tableName: 'chat_messages',
  timestamps: false,
  indexes: [{ fields: ['conversationId', 'createdAt'] }],
})
export class ChatMessageModel extends Model<ChatMessageProps, ChatMessageProps> {
  @Column({ type: DataType.UUID, primaryKey: true })
  id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    references: { model: 'conversations', key: 'id' },
    onDelete: 'CASCADE',
  })
  conversationId: string;

  @Column({ type: DataType.STRING, allowNull: false })
  role: ChatRole;

  @Column({ type: DataType.TEXT, allowNull: false })
  content: string;

  @Column({ type: DataType.STRING, allowNull: true })
  model: string | null;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: Date;
}
