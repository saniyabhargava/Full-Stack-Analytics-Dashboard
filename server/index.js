// server/index.js (ESM)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";   // <-- THIS WAS MISSING

dotenv.config();
const { Pool } = pkg;

const app = express();

/* ---------- Middleware ---------- */
app.use(express.json());
app.use(
  cors({
    origin: [/^http:\/\/localhost:\d+$/], // allow Vite dev during development
    credentials: false,
  })
);

/* ---------- DB ---------- */
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.warn(
    "[warn] DATABASE_URL not set. Create server/.env with DATABASE_URL=postgres://USER:PASS@HOST:PORT/DB"
  );
}
const pool = new Pool({ connectionString: DATABASE_URL });

// helper
const q = async (sql, params) => (await pool.query(sql, params)).rows;

/* ---------- API ---------- */

// health
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// insert event
app.post("/api/events", async (req, res) => {
  try {
    const { user_id, type, metadata } = req.body || {};
    if (!user_id) throw new Error("user_id required");
    if (!type) throw new Error("type required");
    const rows = await q(
      `INSERT INTO events (user_id, type, metadata)
       VALUES ($1,$2,$3)
       RETURNING id, user_id, type, metadata, created_at`,
      [String(user_id), String(type), metadata || {}]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// list events (filters: type, from, to, search)
app.get("/api/events", async (req, res) => {
  try {
    const { type, from, to, search } = req.query;
    const vals = [];
    const where = [];

    if (type) { vals.push(type); where.push(`type = $${vals.length}`); }
    if (from) { vals.push(from); where.push(`created_at >= $${vals.length}`); }
    if (to)   { vals.push(new Date(new Date(to).getTime() + 86400000)); where.push(`created_at < $${vals.length}`); }
    if (search) { vals.push(`%${search}%`); where.push(`CAST(metadata AS TEXT) ILIKE $${vals.length}`); }

    const rows = await q(
      `SELECT id, user_id, type, metadata, created_at
       FROM events
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY created_at DESC
       LIMIT 500`,
      vals
    );
    res.json(rows);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// overview analytics
app.get("/api/analytics/overview", async (req, res) => {
  try {
    const { from, to } = req.query;
    const vals = [];
    const where = [];

    if (from) { vals.push(from); where.push(`created_at >= $${vals.length}`); }
    if (to)   { vals.push(new Date(new Date(to).getTime() + 86400000)); where.push(`created_at < $${vals.length}`); }

    const W = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [byDay, byType, active] = await Promise.all([
      q(
        `SELECT DATE_TRUNC('day', created_at) AS day, COUNT(*)::int AS cnt
         FROM events ${W}
         GROUP BY day
         ORDER BY day ASC
         LIMIT 365`,
        vals
      ),
      q(
        `SELECT type, COUNT(*)::int AS cnt
         FROM events ${W}
         GROUP BY type
         ORDER BY cnt DESC
         LIMIT 10`,
        vals
      ),
      q(
        `SELECT DATE_TRUNC('day', created_at) AS day,
                COUNT(DISTINCT user_id)::int AS active_users
         FROM events ${W}
         GROUP BY day
         ORDER BY day ASC
         LIMIT 365`,
        vals
      ),
    ]);

    res.json({ byDay, byType, active });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/* ---------- Static (serve React build) ---------- */
// MUST be after API routes and before app.listen

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const CLIENT_DIST = path.resolve(__dirname, "..", "client", "dist");
const INDEX_HTML  = path.join(CLIENT_DIST, "index.html");

console.log("[static] dir:", CLIENT_DIST, "index exists:", fs.existsSync(INDEX_HTML));

// log requests (helps debug routing)
app.use((req, _res, next) => { console.log("[hit]", req.method, req.url); next(); });

// 1) static assets
app.use(express.static(CLIENT_DIST));

// 2) root
app.get("/", (_req, res) => res.sendFile(INDEX_HTML));

// 3) SPA catch-all for any non-API path
app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(INDEX_HTML));

/* ---------- Start ---------- */
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
