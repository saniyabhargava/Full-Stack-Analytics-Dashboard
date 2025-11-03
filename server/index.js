// server/index.js (ESM)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const { Pool } = pkg;

const app = express();

/* ---------------- middleware ---------------- */
app.use(express.json());
app.use(
  cors({
    // allow Vite dev locally; on Render the app is same-origin
    origin: [/^http:\/\/localhost:\d+$/],
    credentials: false,
  })
);

/* ---------------- db ---------------- */
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) console.warn("[warn] DATABASE_URL not set");

const pool = new Pool({
  connectionString: DATABASE_URL,
  // Render Postgres requires SSL; local dev typically not
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
const q = async (sql, params) => (await pool.query(sql, params)).rows;

/* normalize event type (case/plural tolerant) */
const normalizeType = (t) => {
  if (!t) return undefined;
  const k = String(t).toLowerCase().trim();
  const map = {
    signup: "signup",
    signups: "signup",
    click: "click",
    clicks: "click",
    purchase: "purchase",
    purchases: "purchase",
    "page_view": "page_view",
    "page-view": "page_view",
    pageview: "page_view",
    pageviews: "page_view",
  };
  return map[k];
};

/* ---------------- api ---------------- */

// health
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(200).json({ ok: false, error: e.message }); // never break UI
  }
});

// small diag (count events)
app.get("/api/diag", async (_req, res) => {
  try {
    const r = await pool.query("SELECT COUNT(*)::int AS n FROM events");
    res.json({ ok: true, rows: r.rows[0].n });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// create event (used by Demo button) — defaults instead of 400
app.post("/api/events", async (req, res) => {
  try {
    let { user_id, type, metadata } = req.body || {};
    if (!user_id) user_id = "anonymous";
    const typeNorm = normalizeType(type) || "page_view";

    const rows = await q(
      `INSERT INTO events (user_id, type, metadata)
       VALUES ($1,$2,$3)
       RETURNING id, user_id, type, metadata, created_at`,
      [String(user_id), typeNorm, metadata || {}]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error("[POST /api/events] failed:", e.message);
    res.status(200).json({ ok: false, error: e.message });
  }
});

// list events (filters: type, from, to, search) — tolerant & never 400
app.get("/api/events", async (req, res) => {
  const vals = [];
  const where = [];

  const t = normalizeType(req.query.type);
  if (t) { vals.push(t); where.push(`type = $${vals.length}`); }

  const { from, to, search } = req.query;

  if (from) { vals.push(from); where.push(`created_at >= $${vals.length}`); }

  if (to) {
    const dt = new Date(to);
    if (!isNaN(dt)) {
      vals.push(new Date(dt.getTime() + 86400000));
      where.push(`created_at < $${vals.length}`);
    }
  }

  if (typeof search === "string" && search.trim()) {
    vals.push(`%${search}%`);
    where.push(`CAST(metadata AS TEXT) ILIKE $${vals.length}`);
  }

  try {
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
    console.error("[GET /api/events] query failed:", e.message);
    res.json([]); // keep UI alive
  }
});

// overview analytics
app.get("/api/analytics/overview", async (req, res) => {
  try {
    const { from, to } = req.query;
    const vals = [];
    const where = [];

    if (from) { vals.push(from); where.push(`created_at >= $${vals.length}`); }
    if (to) {
      const dt = new Date(to);
      if (!isNaN(dt)) {
        vals.push(new Date(dt.getTime() + 86400000));
        where.push(`created_at < $${vals.length}`);
      }
    }

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
    console.error("[GET /api/analytics/overview] failed:", e.message);
    res.json({ byDay: [], byType: [], active: [] });
  }
});

/* ---------------- static (serve React build) ---------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const CLIENT_DIST = path.resolve(__dirname, "..", "client", "dist");
const INDEX_HTML  = path.join(CLIENT_DIST, "index.html");

console.log("[static] dir:", CLIENT_DIST, "index exists:", fs.existsSync(INDEX_HTML));

// useful for tracing on Render logs
app.use((req, _res, next) => { console.log("[hit]", req.method, req.url); next(); });

// static assets
app.use(express.static(CLIENT_DIST));

// root file
app.get("/", (_req, res) => res.sendFile(INDEX_HTML));

// SPA catch-all for non-API routes
app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(INDEX_HTML));

/* ---------------- start ---------------- */
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));

export default app;
