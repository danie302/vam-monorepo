import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  AuthenticationStorage,
  type SessionRecord,
  type SessionStore,
} from '@nestjs/authentication';
import { Op } from 'sequelize';
import { AuthSessionModel } from './auth-session.model.ts';

/**
 * Keeps sessions in the database, so they survive restarts (`start:dev`
 * restarts on every change). Each write is a single statement, as
 * `SessionStore` requires.
 */
@Injectable()
export class SequelizeSessionStore implements SessionStore {
  constructor(
    @InjectModel(AuthSessionModel)
    private readonly sessionModel: typeof AuthSessionModel,
    storage: AuthenticationStorage,
  ) {
    storage.registerSource({ sessions: this });
  }

  /** Loads a session by id (the hash of its cookie token). */
  async getSession(id: string): Promise<SessionRecord | undefined> {
    const row = await this.sessionModel.findByPk(id);
    return row ? toRecord(row) : undefined;
  }

  /** Inserts a session, first deleting the expired ones so the table stays small. */
  async createSession(record: SessionRecord): Promise<void> {
    await this.sessionModel.destroy({
      where: { expiresAt: { [Op.lte]: record.createdAt } },
    });
    await this.sessionModel.create({
      id: record.id,
      userId: record.userId,
      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
      lastActiveAt: record.lastActiveAt,
      mfa: record.mfa ?? null,
      metadata: record.metadata ?? null,
    });
  }

  /** Moves `lastActiveAt` forward (idle timeout); never revives a deleted session. */
  async touchSession(id: string, lastActiveAt: Date): Promise<void> {
    await this.sessionModel.update(
      { lastActiveAt },
      { where: { id, lastActiveAt: { [Op.lt]: lastActiveAt } } },
    );
  }

  /** Deletes a session; `true` if this call deleted it. */
  async deleteSession(id: string): Promise<boolean> {
    const deleted = await this.sessionModel.destroy({ where: { id } });
    return deleted > 0;
  }

  /** Every session of a user, expired ones included. */
  async listUserSessions(userId: string): Promise<SessionRecord[]> {
    const rows = await this.sessionModel.findAll({ where: { userId } });
    return rows.map(toRecord);
  }

  /** Deletes every session of a user ("sign out everywhere"). */
  async deleteUserSessions(userId: string): Promise<void> {
    await this.sessionModel.destroy({ where: { userId } });
  }
}

/** The store contract wants absent optional fields, never `null`. */
function toRecord(row: AuthSessionModel): SessionRecord {
  const record: SessionRecord = {
    id: row.id,
    userId: row.userId,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
    lastActiveAt: row.lastActiveAt,
  };
  if (row.mfa) record.mfa = row.mfa;
  if (row.metadata) record.metadata = row.metadata;
  return record;
}
