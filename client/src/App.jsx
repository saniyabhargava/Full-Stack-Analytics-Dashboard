import { useEffect, useMemo, useState } from 'react';
import './styles.css';
import Filters from './components/Filters.jsx';
import ChartCard from './components/ChartCard.jsx';
import DataTable from './components/DataTable.jsx';
import { fetchOverview, fetchEvents } from './lib/api.js';


export default function App() {
// Filters are held here and passed down to children
const [filters, setFilters] = useState({});
const [overview, setOverview] = useState(null);
const [events, setEvents] = useState([]);
const [loading, setLoading] = useState(false);
const [err, setErr] = useState('');


async function loadAll(newFilters = filters) {
setLoading(true); setErr('');
try {
const [ov, ev] = await Promise.all([
fetchOverview(newFilters),
fetchEvents(newFilters)
]);
setOverview(ov);
setEvents(ev);
} catch (e) {
setErr(e.message);
} finally { setLoading(false); }
}


useEffect(() => { loadAll(); /* initial load */ }, []);


// When Filters changes, reload
useEffect(() => { loadAll(filters); }, [filters]);


const typeChartData = useMemo(() => {
if (!overview?.byType) return [];
return overview.byType.map(r => ({ type: r.type, cnt: Number(r.cnt) }));
}, [overview]);


const byDayData = useMemo(() => {
if (!overview?.byDay) return [];
return overview.byDay.map(r => ({ day: new Date(r.day).toLocaleDateString(), cnt: Number(r.cnt) }));
}, [overview]);


const activeData = useMemo(() => {
if (!overview?.active) return [];
return overview.active.map(r => ({ day: new Date(r.day).toLocaleDateString(), cnt: Number(r.active_users) }));
}, [overview]);


return (
<div className="container">
<header className="header">
<h2 style={{margin:0}}>Analytics Dashboard</h2>
<span className="badge">Demo</span>
</header>


<Filters onChange={setFilters} />


{err && <div className="card" style={{borderColor:'#7f1d1d'}}>Error: {err}</div>}
{loading && <div className="card">Loading…</div>}
</div>
);
}