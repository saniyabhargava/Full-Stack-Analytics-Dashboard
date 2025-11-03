import React, { useEffect, useMemo, useState } from 'react';
import './styles.css';
import Filters from './components/Filters.jsx';
import ChartCard from './components/ChartCard.jsx';
import DataTable from './components/DataTable.jsx';
import { fetchOverview, fetchEvents } from './lib/api.js';

export default function App() {
  const [filters, setFilters] = useState({});
  const [overview, setOverview] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function loadAll(f = filters) {
    setLoading(true); setErr('');
    try {
      const [ov, ev] = await Promise.all([fetchOverview(f), fetchEvents(f)]);
      setOverview(ov); setEvents(ev);
    } catch (e) { setErr(e.message || 'Load Failed'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadAll(filters); }, [filters]);

  const byDayData = useMemo(() =>
    (overview?.byDay || []).map(r => ({ day: new Date(r.day).toLocaleDateString(), cnt: +r.cnt })), [overview]);
  const activeData = useMemo(() =>
    (overview?.active || []).map(r => ({ day: new Date(r.day).toLocaleDateString(), cnt: +r.active_users })), [overview]);
  const typeData = useMemo(() =>
    (overview?.byType || []).map(r => ({ type: r.type, cnt: +r.cnt })), [overview]);

  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <h1 className="title">Analytics Dashboard</h1>
          <span className="badge">Demo</span>
        </header>

        <Filters onChange={setFilters} />

        {err && <div className="alert">Error: {err}</div>}

        <section className="grid">
          <ChartCard title="Events Per Day" data={byDayData} xKey="day" yKey="cnt" />
          <ChartCard title="Active Users Per Day" data={activeData} xKey="day" yKey="cnt" />
          <ChartCard title="Top Event Types" data={typeData} xKey="type" yKey="cnt" kind="bar" />
          <div className="card">
            <div className="card-title">Tips</div>
            <ul className="tips">
              <li>Use Filters For Type / Date / Search.</li>
              <li>Export CSV From The Table. Export PDF For Sharing.</li>
            </ul>
          </div>
        </section>

        <section>
          {loading ? <div className="card">Loading…</div> : <DataTable rows={events} />}
        </section>

        <footer className="footer">React • Express • PostgreSQL</footer>
      </div>
    </div>
  );
}
