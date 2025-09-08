import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

router.get('/lost', async (_req, res) => {
  try {
    const result = await db.withConnection(conn => {
      if (conn.execute) {
        return conn.execute(`SELECT lost_id, item_name, category, lost_location, status FROM LOST_ITEMS ORDER BY lost_id DESC`);
      } else {
        const rows = conn.prepare(`SELECT lost_id, item_name, category, lost_location, status FROM LOST_ITEMS ORDER BY lost_id DESC`).all();
        return { rows };
      }
    });
    res.json(result.rows || result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/lost', async (req, res) => {
  const { item_name, category, lost_location, description } = req.body || {};
  if (!item_name || !category || !lost_location) {
    return res.status(400).json({ error: 'item_name, category, lost_location required' });
  }
  try {
    const result = await db.withConnection(async conn => {
      if (conn.execute) {
        const insertSql = `INSERT INTO LOST_ITEMS (item_name, category, lost_location, description, status) VALUES (:item_name, :category, :lost_location, :description, 'Pending')`;
        await conn.execute(insertSql, { item_name, category, lost_location, description });
        await conn.commit();
        return { ok: true };
      } else {
        conn.prepare(`INSERT INTO LOST_ITEMS (item_name, category, lost_location, description, status) VALUES (?, ?, ?, ?, 'Pending')`).run(item_name, category, lost_location, description);
        return { ok: true };
      }
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/found', async (_req, res) => {
  try {
    const result = await db.withConnection(conn => {
      if (conn.execute) {
        return conn.execute(`SELECT found_id, item_name, category, found_location, status FROM FOUND_ITEMS ORDER BY found_id DESC`);
      } else {
        const rows = conn.prepare(`SELECT found_id, item_name, category, found_location, status FROM FOUND_ITEMS ORDER BY found_id DESC`).all();
        return { rows };
      }
    });
    res.json(result.rows || result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/found', async (req, res) => {
  const { item_name, category, found_location, description } = req.body || {};
  if (!item_name || !category || !found_location) {
    return res.status(400).json({ error: 'item_name, category, found_location required' });
  }
  try {
    const result = await db.withConnection(async conn => {
      if (conn.execute) {
        const insertSql = `INSERT INTO FOUND_ITEMS (item_name, category, found_location, description, status) VALUES (:item_name, :category, :found_location, :description, 'Pending')`;
        await conn.execute(insertSql, { item_name, category, found_location, description });
        await conn.commit();
        return { ok: true };
      } else {
        conn.prepare(`INSERT INTO FOUND_ITEMS (item_name, category, found_location, description, status) VALUES (?, ?, ?, ?, 'Pending')`).run(item_name, category, found_location, description);
        return { ok: true };
      }
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/matches', async (_req, res) => {
  try {
    const result = await db.withConnection(conn => {
      if (conn.execute) {
        return conn.execute(`SELECT match_id, lost_id, found_id, match_date, status FROM MATCHES ORDER BY match_id DESC`);
      } else {
        const rows = conn.prepare(`SELECT match_id, lost_id, found_id, match_date, status FROM MATCHES ORDER BY match_id DESC`).all();
        return { rows };
      }
    });
    res.json(result.rows || result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/automatch', async (_req, res) => {
  try {
    const result = await db.withConnection(async conn => {
      if (conn.execute) {
        await conn.execute(`BEGIN AutoMatchItems; END;`);
        await conn.commit();
        const matches = await conn.execute(`SELECT match_id, lost_id, found_id, match_date, status FROM MATCHES ORDER BY match_id DESC`);
        return matches.rows;
      } else {
        // simple automatch for sqlite
        const lostPending = conn.prepare(`SELECT * FROM LOST_ITEMS WHERE status = 'Pending'`).all();
        for (const lost of lostPending) {
          const found = conn.prepare(`SELECT * FROM FOUND_ITEMS WHERE status = 'Pending' AND item_name = ? AND category = ? AND found_location = ?`).get(lost.item_name, lost.category, lost.lost_location);
          if (found) {
            conn.prepare(`INSERT INTO MATCHES (lost_id, found_id, match_date, status) VALUES (?, ?, datetime('now'), 'Confirmed')`).run(lost.lost_id, found.found_id);
            conn.prepare(`UPDATE LOST_ITEMS SET status = 'Matched' WHERE lost_id = ?`).run(lost.lost_id);
            conn.prepare(`UPDATE FOUND_ITEMS SET status = 'Matched' WHERE found_id = ?`).run(found.found_id);
          }
        }
        const rows = conn.prepare(`SELECT match_id, lost_id, found_id, match_date, status FROM MATCHES ORDER BY match_id DESC`).all();
        return rows;
      }
    });
    res.json(result.rows || result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;


