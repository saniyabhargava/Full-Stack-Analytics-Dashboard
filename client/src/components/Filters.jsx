import React, { useState } from "react";
import { postEvent } from "../lib/api";

export default function Filters({ onChange }) {
  const [type, setType] = useState("signup");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  const apply = () => onChange({ type, from, to, search });
  const clear = () => { setType(""); setFrom(""); setTo(""); setSearch(""); onChange({}); };

  async function addDemo() {
    try {
      setBusy(true);
      await postEvent({
        user_id: `U_${Math.floor(Math.random()*900+100)}`,
        type: type || "signup",
        metadata: { Source: "Demo", Query: search || "UI" }
      });
      apply(); // refresh data with current filters
    } catch (e) {
      alert(`Demo Failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="filters-row">
        <div className="field">
          <label>Type</label>
          <select className="select" value={type} onChange={e=>setType(e.target.value)}>
            <option value="">All</option>
            <option value="page_view">Page Views</option>
            <option value="click">Clicks</option>
            <option value="signup">Signups</option>
            <option value="purchase">Purchases</option>
          </select>
        </div>
        <div className="field"><label>From</label>
          <input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
        </div>
        <div className="field"><label>To</label>
          <input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)} />
        </div>
        <div className="field grow"><label>Search (In Metadata)</label>
          <input className="input" placeholder="Home, Product-123..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </div>

      <div className="actions">
        <button className="btn" onClick={apply}>Apply</button>
        <button className="btn secondary" onClick={clear}>Clear</button>
        <div className="spacer" />
        <button className="btn ghost" onClick={addDemo} disabled={busy}>{busy ? "Adding…" : "Demo"}</button>
      </div>
    </div>
  );
}
