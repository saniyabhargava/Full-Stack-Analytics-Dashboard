// Simple PG pool so every route can query the DB.
import pg from 'pg';
import dotenv from 'dotenv';


dotenv.config();


const { Pool } = pg;


export const pool = new Pool({ connectionString: process.env.DATABASE_URL });


export async function query(text, params) {
// Small helper so I don't have to import pool everywhere
const res = await pool.query(text, params);
return res;
}