// Basic validators — not perfect, just enough to keep inputs sane.
export function requireString(name, val) {
if (typeof val !== 'string' || !val.trim()) {
throw new Error(`${name} must be a non-empty string`);
}
}


export function requireISODate(name, val) {
// expects 'YYYY-MM-DD' or ISO string; we keep it forgiving
const d = new Date(val);
if (Number.isNaN(d.getTime())) {
throw new Error(`${name} must be a valid date`);
}
}


export function cleanLike(val) {
// Prevents `%` wildcards exploding the search accidentally
return String(val || '').replaceAll('%', '').trim();
}