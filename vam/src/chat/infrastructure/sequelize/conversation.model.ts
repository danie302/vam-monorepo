import { Column, DataType, Model, Table } from 'sequelize-typescript';
import type { ConversationProps } from '../../domain/conversation.ts';

/** Sequelize's view of a conversation. Never leaves this folder. */
@Table({
  tableName: 'conversations',
  timestamps: false,
  // The sidebar query: a user's conversations by recent activity.
  indexes: [{ fields: ['userId', 'updatedAt'] }],
})
export class ConversationModel extends Model<ConversationProps, ConversationProps> {
  @Column({ type: DataType.UUID, primaryKey: true })
  id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  })
  userId: string;

  @Column({ type: DataType.STRING, allowNull: true })
  title: string | null;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: Date;
}
