import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';


export default function ChartCard({ title, kind = 'line', data = [], xKey = 'day', yKey = 'cnt' }) {
// Keep charts dead-simple — readable and clean.
return (
<div className="card">
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
<strong>{title}</strong>
<span className="badge">{data?.length || 0} pts</span>
</div>
<div style={{width:'100%', height:260}}>
<ResponsiveContainer>
{kind === 'bar' ? (
<BarChart data={data}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey={xKey} />
<YAxis allowDecimals={false} />
<Tooltip />
<Bar dataKey={yKey} />
</BarChart>
) : (
<LineChart data={data}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey={xKey} />
<YAxis allowDecimals={false} />
<Tooltip />
<Line type="monotone" dataKey={yKey} dot={false} />
</LineChart>
)}
</ResponsiveContainer>
</div>
</div>
);
}