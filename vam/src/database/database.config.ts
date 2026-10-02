import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { SequelizeModuleOptions } from '@nestjs/sequelize';

const storage = process.env.DB_STORAGE ?? '.db/data.sqlite3';

// SQLite creates the file but not its folder.
if (storage !== ':memory:') {
  mkdirSync(dirname(storage), { recursive: true });
}

export const dataBaseConfig: SequelizeModuleOptions = {
  dialect: 'sqlite',
  storage,
  autoLoadModels: true,
  // Creates missing tables (`CREATE TABLE IF NOT EXISTS`); never alters or
  // drops existing ones, so it is safe in every environment. After changing
  // a model, delete the .db file. Replace with migrations once data must be
  // kept across model changes.
  synchronize: true,
  logging: false,
};
