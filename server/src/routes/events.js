import { Router } from 'express';
router.post('/', async (req, res) => {
try {
const { user_id, type, metadata } = req.body;
requireString('user_id', user_id);
requireString('type', type);


const insert = `
INSERT INTO events (user_id, type, metadata)
VALUES ($1, $2, $3)
RETURNING id, user_id, type, metadata, created_at;
`;


const result = await query(insert, [user_id.trim(), type.trim(), metadata || {}]);
res.status(201).json(result.rows[0]);
} catch (err) {
res.status(400).json({ error: err.message });
}
});


// GET /api/events — list events with optional filters
// /api/events?type=page_view&from=2025-10-01&to=2025-10-31&search=home
router.get('/', async (req, res) => {
try {
const { type, from, to, search } = req.query;
const values = [];
const where = [];


if (type) { values.push(type); where.push(`type = $${values.length}`); }
if (from) { requireISODate('from', from); values.push(from); where.push(`created_at >= $${values.length}`); }
if (to) { requireISODate('to', to); values.push(new Date(new Date(to).getTime() + 24*3600*1000)); where.push(`created_at < $${values.length}`); }
if (search) { values.push(`%${String(search).trim()}%`); where.push(`CAST(metadata AS TEXT) ILIKE $${values.length}`); }


const sql = `
SELECT id, user_id, type, metadata, created_at
FROM events
${where.length ? 'WHERE ' + where.join(' AND ') : ''}
ORDER BY created_at DESC
LIMIT 500;
`;


const result = await query(sql, values);
res.json(result.rows);
} catch (err) {
res.status(400).json({ error: err.message });
}
});


export default router;