// server/scripts/generate_data.js
import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// tunables via args: --days 90 --users 1500 --events 15000
const args = Object.fromEntries(
  process.argv.slice(2).map(s => {
    const [k, v] = s.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

const DAYS   = Number(args.days ?? 90);
const USERS  = Number(args.users ?? 1500);
const EVENTS = Number(args.events ?? 20000);

const TYPES = ['page_view', 'click', 'signup', 'purchase'];
const PATHS = ['/','/home','/pricing','/product/alpha','/product/beta','/docs','/blog/setup','/checkout'];
const PRODUCTS = ['alpha','beta','gamma','delta'];
const SOURCES = ['Direct','SEO','Referral','Email','Ads'];

function rand(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function randN(n) { return Math.floor(Math.random()*n); }
function sampleNormal(mean, spread=0.5){ return Math.max(0, Math.round((mean + (Math.random()-0.5)*2*spread) )); }

function daysAgo(n){
  const d = new Date();
  d.setHours(12,0,0,0);
  d.setDate(d.getDate()-n);
  // add time-of-day noise
  d.setHours(randN(24), randN(60), randN(60), 0);
  return d;
}

async function main() {
  console.log(`[seed] connecting...`);
  await pool.query('BEGIN');

  // small safety: ensure table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      metadata JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
    CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
  `);

  console.log(`[seed] wiping old seed rows (optional)`);
  // comment next line if you want to keep previous rows
  // await pool.query(`DELETE FROM events WHERE metadata ? 'seed_tag'`);

  console.log(`[seed] generating users...`);
  const users = Array.from({length: USERS}, (_,i)=> `u_${100+i}`);

  // Daily traffic curve (Mon–Fri > weekend)
  const dailyTarget = Array.from({length: DAYS}, (_,i)=>{
    const date = daysAgo(DAYS-1-i);
    const dow = date.getDay(); // 0 Sun..6 Sat
    const base = (dow===0 || dow===6) ? 120 : 260; // weekend lower
    return sampleNormal(base, 80);
  });

  console.log(`[seed] inserting ${EVENTS} events across ${DAYS} days...`);
  let inserted = 0;

  for (let i=0; i<DAYS; i++){
    const date = daysAgo(DAYS-1-i);
    const dayEvents = Math.max(20, Math.min(EVENTS - inserted, dailyTarget[i]));
    for (let j=0; j<dayEvents; j++){
      const user = rand(users);

      // funnel-ish probabilities
      const r = Math.random();
      let type = 'page_view';
      if (r > 0.85) type = 'purchase';
      else if (r > 0.65) type = 'signup';
      else if (r > 0.35) type = 'click';

      const meta = {
        seed_tag: 'synthetic',
        Path: rand(PATHS),
        Product: rand(PRODUCTS),
        Source: rand(SOURCES),
        Note: 'seed'
      };

      await pool.query(
        `INSERT INTO events (user_id, type, metadata, created_at)
         VALUES ($1,$2,$3,$4)`,
        [user, type, meta, date]
      );
      inserted++;
      if (inserted >= EVENTS) break;
    }
    if (inserted >= EVENTS) break;
  }

  await pool.query('COMMIT');
  console.log(`[seed] done. Inserted ${inserted} events.`);
  await pool.end();
}

main().catch(async (e)=>{
  console.error(`[seed] FAILED`, e);
  try { await pool.query('ROLLBACK'); } catch {}
  process.exit(1);
});
