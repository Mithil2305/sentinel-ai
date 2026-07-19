# SentinelAI - Security Operations Center (SOC) Frontend Dashboard

This directory contains the Next.js client-side interface for **SentinelAI**. It is built with React, TypeScript, TailwindCSS, and leverages shadcn/ui components to deliver a premium, dark-themed, glassmorphic security dashboard interface.

---

## 🚀 Key Dashboard Pages

1. **Dashboard** (`/dashboard`):
   - High-level security posture summary, dynamic bento-grid metric cards, and live chart widgets visualizing threat event categories.
2. **Incidents** (`/incidents`):
   - Detailed incident viewer showing alert status, severity, source node, matched rule identifier, and timeline. 
   - Supports manual remediation execution and audit history.
3. **Approvals** (`/approvals`):
   - Human-in-the-loop (HITL) authorization console. Operators can review proposed actions (e.g. process freeze, port blocks) and approve or reject them.
4. **Servers** (`/servers`):
   - List of enrolled agent servers, OS specs, IP addresses, agent tokens, and ping latency metrics.
5. **Monitoring** (`/monitoring`):
   - Diagnostic terminal console streaming raw WebSocket telemetry events directly from FastAPI.
6. **Intelligence** (`/intelligence`):
   - Threat intelligence database detailing current Sigma/YARA rules, MITRE ATT&CK coverage, and indicator rules.
7. **Reports** (`/reports`):
   - Custom report generation engine for compliance and CISO executive summaries.

---

## 🛠️ Development & Script Command Reference

In this folder, you can run the following package scripts:

### Install Packages
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the client dashboard.

### Build Production Bundle
```bash
npm run build
```

### Run Production Build
```bash
npm run start
```

---

## 📁 Directory Architecture

```
frontend/
├── app/                  # Next.js App Router folders and page views
│   ├── approvals/        # Human-in-the-loop approval views
│   ├── dashboard/        # Main posture visual analytics
│   ├── incidents/        # Threat incident logs and response controls
│   ├── monitoring/       # Diagnostic terminal logs
│   ├── servers/          # Agent server registration
│   └── page.tsx          # Login redirect root route
├── components/           # Reusable UI widgets and custom layout cells
│   ├── ui/               # Core design elements (buttons, inputs, tables)
│   └── theme-provider.tsx# Global CSS style parameters and dark-mode
├── hooks/                # Custom React hook utilities (e.g. useWebSocket)
├── services/             # HTTP clients mapped to FastAPI backend routes
└── store/                # Client state management stores
```
