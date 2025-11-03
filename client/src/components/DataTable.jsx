import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { exportCsv } from "../lib/api";

export default function DataTable({ rows = [] }) {
  function exportPdf() {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt" });
    const head = [["ID","User","Type","Metadata","Created"]];
    const body = rows.map(r => [
      r.id, r.user_id, r.type,
      typeof r.metadata === "object" ? JSON.stringify(r.metadata) : String(r.metadata ?? ""),
      new Date(r.created_at).toLocaleString()
    ]);
    autoTable(doc, {
      head, body,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [110,168,254] },
      margin: 24
    });
    doc.save("events.pdf"); // triggers real download
  }

  return (
    <div className="card">
      <div className="table-header">
        <strong>Events</strong>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn" onClick={() => exportCsv(rows)}>Export CSV</button>
          <button className="btn secondary" onClick={exportPdf}>Export PDF</button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>User</th><th>Type</th><th>Metadata</th><th>Created</th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.user_id}</td>
                <td><span className="pill">{capitalize(r.type)}</span></td>
                <td><code style={{fontSize:12}}>{formatMeta(r.metadata)}</code></td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {!rows.length && (<tr><td colSpan={5} style={{color:"#9aa4b2"}}>No Events</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatMeta(m) {
  if (!m) return "";
  try { return JSON.stringify(m); } catch { return String(m); }
}
function capitalize(s){ return (s||"").replace(/(^|\s)\S/g, c => c.toUpperCase()); }
