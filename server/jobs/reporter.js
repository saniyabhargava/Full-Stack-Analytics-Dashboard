import cron from "node-cron";
import nodemailer from "nodemailer";
import { stringify } from "csv-stringify/sync";
import pkg from "pg";
const { Pool } = pkg;

export function startReporter({ dbUrl, mail }) {
  const pool = new Pool({ connectionString: dbUrl });

  const transporter = nodemailer.createTransport({
    host: mail.host,
    port: Number(mail.port),
    secure: mail.secure === "true",
    auth: mail.user && mail.pass ? { user: mail.user, pass: mail.pass } : undefined,
  });

  // Every day at 09:00
  cron.schedule("0 9 * * *", async () => {
    try {
      const { rows: byType } = await pool.query(`
        SELECT type, COUNT(*)::int AS count
        FROM events
        WHERE created_at >= NOW() - INTERVAL '1 day'
        GROUP BY type ORDER BY count DESC;
      `);

      const csv = stringify(byType, { header: true });
      await transporter.sendMail({
        from: mail.from,
        to: mail.to,
        subject: "Daily Analytics Summary",
        text: "Attached: event counts by type (last 24h).",
        attachments: [{ filename: "daily_summary.csv", content: csv }],
      });
      console.log("[report] sent daily summary");
    } catch (e) {
      console.error("[report] failed:", e.message);
    }
  });

  console.log("[report] scheduled daily 09:00");
}
