// CSV export is done client-side to keep backend simple.
export function exportToCSV(rows, filename = 'events.csv') {
if (!rows?.length) return;
const headers = Object.keys(rows[0]);
const escape = (v) => '"' + String(v).replaceAll('"','""') + '"';
const csv = [headers.join(',')]
.concat(rows.map(r => headers.map(h => escape(typeof r[h] === 'object' ? JSON.stringify(r[h]) : (r[h] ?? ''))).join(',')))
.join('\n');


const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url; a.download = filename; a.click();
URL.revokeObjectURL(url);
}