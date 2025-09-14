import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Replicate __dirname functionality in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Allow cross-origin requests for local dev (Live Server / other origins)
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Crucial: This allows the server to read JSON from requests

// Connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'data.sqlite'), (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// --- API ENDPOINTS ---

// GET /api/matches
app.get('/api/matches', (req, res) => {
  db.all(
    `SELECT match_id, lost_id, found_id, match_date, status FROM MATCHES ORDER BY match_date DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// POST /api/lost - HANDLES SUBMITTING A LOST ITEM
app.post('/api/lost', (req, res) => {
  const { item_name, category, lost_location, description } = req.body;
  console.log('Received lost item:', req.body); // Log to see if data arrives
  const sql = `INSERT INTO LOST_ITEMS (item_name, category, lost_location, description) VALUES (?, ?, ?, ?)`;
  db.run(sql, [item_name, category, lost_location, description], function (err) {
    if (err) {
      console.error("SQL Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
});

// POST /api/found - HANDLES SUBMITTING A FOUND ITEM
app.post('/api/found', (req, res) => {
  const { item_name, category, found_location, description } = req.body;
  console.log('Received found item:', req.body); // Log to see if data arrives
  const sql = `INSERT INTO FOUND_ITEMS (item_name, category, found_location, description) VALUES (?, ?, ?, ?)`;
  db.run(sql, [item_name, category, found_location, description], function (err) {
    if (err) {
      console.error("SQL Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
});

// POST /api/automatch
app.post('/api/automatch', (req, res) => {
  const findMatchesSql = `
    SELECT l.lost_id, f.found_id
    FROM LOST_ITEMS l
    JOIN FOUND_ITEMS f ON lower(l.item_name) = lower(f.item_name) AND lower(l.category) = lower(f.category) AND lower(l.lost_location) = lower(f.found_location)
    WHERE l.lost_id NOT IN (SELECT lost_id FROM MATCHES WHERE lost_id IS NOT NULL)
      AND f.found_id NOT IN (SELECT found_id FROM MATCHES WHERE found_id IS NOT NULL)
  `;

  db.all(findMatchesSql, [], (err, potentialMatches) => {
    if (err) return res.status(500).json({ error: err.message });
    if (potentialMatches.length === 0) {
      return res.json({ message: 'No new matches found.' });
    }

    const insertSql = `INSERT INTO MATCHES (lost_id, found_id, match_date, status) VALUES (?, ?, datetime('now'), 'Pending')`;
    let completed = 0;
    potentialMatches.forEach(match => {
      db.run(insertSql, [match.lost_id, match.found_id], (err) => {
        if (err) console.error("Error inserting match:", err.message);
        completed++;
        if (completed === potentialMatches.length) {
          res.json({ message: `AutoMatch complete. Found ${potentialMatches.length} new match(es).` });
        }
      });
    });
  });
});

// GET /api/lost - return lost items
app.get('/api/lost', (req, res) => {
  db.all(`SELECT lost_id, item_name, category, lost_location, description, created_at FROM LOST_ITEMS ORDER BY lost_id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /api/found - return found items
app.get('/api/found', (req, res) => {
  db.all(`SELECT found_id, item_name, category, found_location, description, created_at FROM FOUND_ITEMS ORDER BY found_id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/match/:id/status - update status of a match
app.post('/api/match/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  if (!id || !status) return res.status(400).json({ error: 'Missing match id or status' });
  const sql = `UPDATE MATCHES SET status = ? WHERE match_id = ?`;
  db.run(sql, [status, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Match not found' });
    res.json({ ok: true, match_id: id, status });
  });
});

// POST /api/admin/reset - clear LOST_ITEMS, FOUND_ITEMS and MATCHES (demo only)
app.post('/api/admin/reset', (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM MATCHES', [], function(err) { if (err) console.error('Reset MATCHES error', err.message); });
    db.run('DELETE FROM LOST_ITEMS', [], function(err) { if (err) console.error('Reset LOST_ITEMS error', err.message); });
    db.run('DELETE FROM FOUND_ITEMS', [], function(err) { if (err) console.error('Reset FOUND_ITEMS error', err.message); });
    // Optionally vacuum to reclaim space
    db.run('VACUUM', [], function(err) { if (err) console.error('VACUUM error', err.message); });
    res.json({ ok: true, message: 'Database reset (demo).' });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});