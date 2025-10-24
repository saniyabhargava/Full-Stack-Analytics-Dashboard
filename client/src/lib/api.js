const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';


export async function fetchOverview(params = {}) {
const qs = new URLSearchParams(params).toString();
const res = await fetch(`${API_BASE}/analytics/overview?${qs}`);
if (!res.ok) throw new Error('Failed to load analytics');
return res.json();
}


export async function fetchEvents(params = {}) {
const qs = new URLSearchParams(params).toString();
const res = await fetch(`${API_BASE}/events?${qs}`);
if (!res.ok) throw new Error('Failed to load events');
return res.json();
}