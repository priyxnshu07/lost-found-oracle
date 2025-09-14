import dotenv from 'dotenv';
import { withConnection as sqliteWithConnection } from './sqlite.js';
import { withConnection as oracleWithConnection } from './oracle.js';

dotenv.config();

const driver = (process.env.DB_DRIVER || 'oracle').toLowerCase();

export const db = {
  withConnection: driver === 'sqlite' ? sqliteWithConnection : oracleWithConnection
};