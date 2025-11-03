# Full-Stack Analytics Dashboard  
Data-Driven Insights for Modern Applications  

A full-stack web analytics platform that visualizes user event data in real time through an interactive dashboard.  
Developed as part of postgraduate coursework to demonstrate backend integration with PostgreSQL, data visualization using React, and full-stack deployment on Render.

---

## Live Demo  

**Deployed Application:** [https://full-stack-analytics-dashboard.onrender.com](https://full-stack-analytics-dashboard.onrender.com)

---

## Overview  

The Analytics Dashboard tracks and visualizes event activity such as signups, clicks, page views, and purchases.  
It enables filtering by event type, date range, or metadata, allowing users to interpret user behavior trends and generate PDF or CSV exports of data for reporting.

The project highlights a production-ready analytics pipeline with a PostgreSQL database, an Express.js backend API, and a Vite-based React frontend.

---

## Features  

- Interactive charts displaying event frequency and user activity  
- Advanced filtering by type, date range, and metadata  
- CSV and PDF export capabilities for reporting and sharing  
- Real-time demo mode with synthetic data generation  
- PostgreSQL data persistence with clean schema design  
- Secure API endpoints using Express.js and CORS protection  
- Responsive and accessible dark-themed UI built with React and TailwindCSS  
- Deployed on Render with integrated PostgreSQL instance  

---

## System Architecture  
```bash
React (Vite) + TailwindCSS
│
│ REST API Calls (Fetch / Axios)
▼
Express.js Backend (Node.js)
│
▼
PostgreSQL Database (Render Cloud)
```

The frontend provides data visualization and filtering controls, while the backend serves aggregated analytics data through RESTful endpoints.  
All data is stored and queried from PostgreSQL for consistency and scalability.

---

## Technology Stack  

| Layer | Technology |
|-------|-------------|
| Frontend | React (Vite), TailwindCSS, Recharts |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Render Cloud) |
| Deployment | Render (Full-Stack App + Database) |
| Version Control | Git, GitHub |

---

## Screenshots  

### Dashboard View  
Visualizes event types, active users, and usage trends  
![Dashboard Screenshot](https://via.placeholder.com/1000x450?text=Analytics+Dashboard)

### Event Table  
Sortable, searchable event data with CSV and PDF export  
![Events Screenshot](https://via.placeholder.com/1000x450?text=Events+Table)

### Filtering and Reports  
Filter by event type, date range, or metadata for focused analysis  
![Filter Screenshot](https://via.placeholder.com/1000x450?text=Filtering+and+Reports)

---

## Local Development Setup  

### Prerequisites  

- Node.js (v20 or higher)  
- npm  
- PostgreSQL 14 or higher  

---

### Installation Steps  

#### 1. Clone the Repository  
```bash
git clone https://github.com/saniyabhargava/Full-Stack-Analytics-Dashboard.git
cd Full-Stack-Analytics-Dashboard
```
2. Client Setup
```
cd client
npm install
cp .env.example .env
```
Update .env:
```
VITE_API_BASE=http://localhost:4000/api
```
Start the frontend:
```
npm run dev
```
3. Server Setup
```
cd ../server
npm install
cp .env.example .env
```
Update .env:
```
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```
Start the backend:

```
npm run dev
```
## Access the Application

- **Frontend:** [http://localhost:5173](http://localhost:5173)  
- **Backend API:** [http://localhost:4000/api](http://localhost:4000/api)

---

## Database Schema

```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_events_user ON events(user_id);
```
This schema supports fast filtering by event type, creation time, and user activity.

---

## Deployment Configuration  

### Render (Full-Stack Hosting)

**Root Directory:** `server`  

**Build Command:**  
```bash
cd ../client && npm install && npm run build && cd ../server && npm install
```
**Start Command:**
```bash
Copy code
node index.js
```
**Environment Variables:**
```bash
DATABASE_URL=postgresql://<render_postgres_connection_string>
NODE_ENV=production
CLIENT_ORIGIN=https://full-stack-analytics-dashboard.onrender.com
ENABLE_JOBS=1
SMTP_HOST=<smtp_host>
SMTP_PORT=<smtp_port>
SMTP_SECURE=false
SMTP_USER=<smtp_user>
SMTP_PASS=<smtp_pass>
REPORT_FROM=reports@example.com
REPORT_TO=your-email@example.com
```
## Key Learnings  

- Full-stack integration between Express.js and PostgreSQL  
- Automated schema migration and data seeding for production  
- Efficient data visualization using React and Recharts  
- Secure deployment workflow using Render with environment variables  
- Backend-driven data filtering and CSV/PDF report generation  
- Hands-on experience building and deploying a complete analytics pipeline  

---

## Future Improvements  

- Authentication for restricted dashboard access  
- Time-series data aggregation for faster trend queries  
- Integration with third-party APIs for real-world event ingestion  
- Automated daily email reports using cron jobs  
- Advanced data visualization (e.g., heatmaps, retention curves)  

---

## Author  

**Saniya Bhargava**  
MSc Computer Science, University College Dublin  

[LinkedIn](https://linkedin.com/in/saniyabhargava) | [GitHub](https://github.com/saniyabhargava)
