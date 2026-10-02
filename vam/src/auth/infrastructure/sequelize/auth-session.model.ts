import { Column, DataType, Index, Model, Table } from 'sequelize-typescript';
import type { MfaState } from '@nestjs/authentication';

export interface AuthSessionAttributes {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
  mfa: MfaState | null;
  metadata: Record<string, unknown> | null;
}

/** A row of `SequelizeSessionStore`: one signed-in browser. */
@Table({ tableName: 'auth_sessions', timestamps: false })
export class AuthSessionModel extends Model<
  AuthSessionAttributes,
  AuthSessionAttributes
> {
  /** SHA-256 of the cookie token. */
  @Column({ type: DataType.STRING, primaryKey: true })
  id: string;

  @Index
  @Column({ type: DataType.STRING, allowNull: false })
  userId: string;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: Date;

  @Index
  @Column({ type: DataType.DATE, allowNull: false })
  expiresAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  lastActiveAt: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  mfa: MfaState | null;

  @Column({ type: DataType.JSON, allowNull: true })
  metadata: Record<string, unknown> | null;
}
