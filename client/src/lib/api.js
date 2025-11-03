const BASE = (import.meta.env.VITE_API_BASE || "/api").replace(/\/$/, "");

async function http(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export const fetchOverview = (f = {}) => {
  const p = new URLSearchParams();
  if (f.from) p.set("from", f.from);
  if (f.to)   p.set("to", f.to);
  return http(`/analytics/overview?${p.toString()}`);
};

export const fetchEvents = (f = {}) => {
  const p = new URLSearchParams();
  if (f.type)   p.set("type", f.type);
  if (f.from)   p.set("from", f.from);
  if (f.to)     p.set("to", f.to);
  if (f.search) p.set("search", f.search);
  return http(`/events?${p.toString()}`);
};

export const postEvent = (payload) =>
  http(`/events`, { method: "POST", body: JSON.stringify(payload) });

export const exportCsv = (rows) => {
  if (!rows?.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(r =>
      headers.map(h => {
        const v = typeof r[h] === "object" ? JSON.stringify(r[h]) : (r[h] ?? "");
        return `"${String(v).replaceAll('"','""')}"`;
      }).join(",")
    )
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: "events.csv" });
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
};
