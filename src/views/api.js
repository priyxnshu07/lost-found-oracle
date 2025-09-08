import { Router } from 'express';
import { withConnection } from '../db/oracle.js';

const router = Router();

router.get('/lost', async (_req, res) => {
  try {
    const result = await withConnection(conn =>
      conn.execute(
        `SELECT lost_id, item_name, category, lost_location, status FROM LOST_ITEMS ORDER BY lost_id DESC`
      )
    );
    res.json(result.rows);
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
    const result = await withConnection(async conn => {
      const insertSql = `INSERT INTO LOST_ITEMS (item_name, category, lost_location, description, status) VALUES (:item_name, :category, :lost_location, :description, 'Pending')`;
      await conn.execute(insertSql, { item_name, category, lost_location, description });
      await conn.commit();
      return { ok: true };
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/found', async (_req, res) => {
  try {
    const result = await withConnection(conn =>
      conn.execute(
        `SELECT found_id, item_name, category, found_location, status FROM FOUND_ITEMS ORDER BY found_id DESC`
      )
    );
    res.json(result.rows);
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
    const result = await withConnection(async conn => {
      const insertSql = `INSERT INTO FOUND_ITEMS (item_name, category, found_location, description, status) VALUES (:item_name, :category, :found_location, :description, 'Pending')`;
      await conn.execute(insertSql, { item_name, category, found_location, description });
      await conn.commit();
      return { ok: true };
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/matches', async (_req, res) => {
  try {
    const result = await withConnection(conn =>
      conn.execute(
        `SELECT match_id, lost_id, found_id, match_date, status FROM MATCHES ORDER BY match_id DESC`
      )
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/automatch', async (_req, res) => {
  try {
    const result = await withConnection(async conn => {
      // Execute your stored procedure AUTOMATCHITEMS
      await conn.execute(`BEGIN AutoMatchItems; END;`);
      await conn.commit();
      const matches = await conn.execute(`SELECT match_id, lost_id, found_id, match_date, status FROM MATCHES ORDER BY match_id DESC`);
      return matches.rows;
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;


