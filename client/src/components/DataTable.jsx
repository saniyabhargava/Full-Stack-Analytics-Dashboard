import { exportToCSV } from '../lib/export';


export default function DataTable({ rows = [] }) {
return (
<div className="card">
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
<strong>Events</strong>
<div style={{display:'flex',gap:8}}>
<button className="btn" onClick={()=>exportToCSV(rows)}>Export CSV</button>
<button className="btn" onClick={()=>window.print()} title="Use browser print to save as PDF">PDF</button>
</div>
</div>
<div style={{overflowX:'auto'}}>
<table className="table">
<thead>
<tr>
<th>ID</th>
<th>User</th>
<th>Type</th>
<th>Metadata</th>
<th>Created</th>
</tr>
</thead>
<tbody>
{rows.map(r => (
<tr key={r.id}>
<td>{r.id}</td>
<td>{r.user_id}</td>
<td><span className="badge">{r.type}</span></td>
<td style={{maxWidth:380,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
{typeof r.metadata === 'object' ? JSON.stringify(r.metadata) : String(r.metadata)}
</td>
<td>{new Date(r.created_at).toLocaleString()}</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
);
}