import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import eventsRoute from './routes/events.js';
import analyticsRoute from './routes/analytics.js';
import { pool } from './db.js';


dotenv.config();


const app = express();
app.use(cors()); // allow localhost:5173 during dev
app.use(express.json()); // parse JSON bodies


app.get('/api/health', async (_req, res) => {
try {
// simple DB check
await pool.query('SELECT 1');
res.json({ ok: true });
} catch (err) {
res.status(500).json({ ok: false, error: err.message });
}
});


app.use('/api/events', eventsRoute);
app.use('/api/analytics', analyticsRoute);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));