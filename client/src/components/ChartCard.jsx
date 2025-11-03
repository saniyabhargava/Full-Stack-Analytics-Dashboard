import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, BarChart, Bar
} from "recharts";

export default function ChartCard({ title, kind = "line", data = [], xKey = "day", yKey = "cnt" }) {
  return (
    <div className="card">
      <div className="card-title">{title}<span className="badge small">{data.length} pts</span></div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          {kind === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={yKey} />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey={yKey} dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
