import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import itemsRouter from './views/api.js';
import { db } from './db/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

app.get('/health', async (_req, res) => {
  try {
    // Test database connection
    await db.withConnection(conn => {
      if (conn.execute) {
        return conn.execute('SELECT 1 as test FROM DUAL');
      } else {
        return conn.prepare('SELECT 1 as test').get();
      }
    });
    res.json({ ok: true, database: 'connected' });
  } catch (e) {
    console.error('Health check failed:', e);
    res.json({ ok: true, database: 'error', error: e.message });
  }
});

app.use('/api', itemsRouter);

// Fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://${host}:${port}`);
});


