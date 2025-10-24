import { useState } from 'react';


export default function Filters({ onChange }) {
// Local state that we push up when the user presses Apply
const [type, setType] = useState('');
const [from, setFrom] = useState('');
const [to, setTo] = useState('');
const [search, setSearch] = useState('');


function apply() {
onChange({ type, from, to, search });
}
function clearAll() {
setType(''); setFrom(''); setTo(''); setSearch(''); onChange({});
}


return (
<div className="card" style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8,alignItems:'end'}}>
<div style={{gridColumn:'span 2'}}>
<label>Type</label>
<select className="select" value={type} onChange={e=>setType(e.target.value)}>
<option value="">All</option>
<option value="page_view">page_view</option>
<option value="click">click</option>
<option value="signup">signup</option>
<option value="purchase">purchase</option>
</select>
</div>
<div>
<label>From</label>
<input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
</div>
<div>
<label>To</label>
<input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)} />
</div>
<div style={{gridColumn:'span 2'}}>
<label>Search (in metadata)</label>
<input className="input" placeholder="home, product-123…" value={search} onChange={e=>setSearch(e.target.value)} />
</div>
<div style={{display:'flex',gap:8}}>
<button className="btn" onClick={apply}>Apply</button>
<button className="btn" onClick={clearAll} style={{background:'#334155',color:'#e7e9ee'}}>Clear</button>
</div>
</div>
);
}