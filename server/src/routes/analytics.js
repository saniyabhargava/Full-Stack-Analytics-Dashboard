import { Router } from 'express';


// GET /api/analytics/overview?from=YYYY-MM-DD&to=YYYY-MM-DD
// Returns small set of metrics we can chart easily on the frontend
router.get('/overview', async (req, res) => {
try {
const { from, to } = req.query;
const values = [];
const where = [];


if (from) { values.push(from); where.push(`created_at >= $${values.length}`); }
if (to) { values.push(new Date(new Date(to).getTime() + 24*3600*1000)); where.push(`created_at < $${values.length}`); }


const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';


// 1) events per day
const byDaySql = `
SELECT DATE_TRUNC('day', created_at) AS day, COUNT(*) AS cnt
FROM events
${whereSql}
GROUP BY day
ORDER BY day ASC
LIMIT 365;
`;


// 2) top event types
const byTypeSql = `
SELECT type, COUNT(*) AS cnt
FROM events
${whereSql}
GROUP BY type
ORDER BY cnt DESC
LIMIT 10;
`;


// 3) active users (unique user_id) per day
const activeSql = `
SELECT DATE_TRUNC('day', created_at) AS day, COUNT(DISTINCT user_id) AS active_users
FROM events
${whereSql}
GROUP BY day
ORDER BY day ASC
LIMIT 365;
`;


const [byDay, byType, active] = await Promise.all([
query(byDaySql, values),
query(byTypeSql, values),
query(activeSql, values)
]);


res.json({
byDay: byDay.rows,
byType: byType.rows,
active: active.rows
});
} catch (err) {
res.status(400).json({ error: err.message });
}
});


export default router;