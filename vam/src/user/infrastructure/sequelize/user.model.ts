import { Column, DataType, Model, Table } from 'sequelize-typescript';
import type { UserProps } from '../../domain/user.ts';

/** Sequelize's view of a user. Never leaves this folder: the repository maps it to `User`. */
@Table({ tableName: 'users', timestamps: false })
export class UserModel extends Model<UserProps, UserProps> {
  @Column({ type: DataType.UUID, primaryKey: true })
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  passwordHash: string;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: Date;
}
