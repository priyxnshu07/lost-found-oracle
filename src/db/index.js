import dotenv from 'dotenv';
dotenv.config();

const driver = (process.env.DB_DRIVER || 'oracle').toLowerCase();

let impl;
if (driver === 'sqlite') {
  impl = await import('./sqlite.js');
} else {
  impl = await import('./oracle.js');
}

export const db = impl;


