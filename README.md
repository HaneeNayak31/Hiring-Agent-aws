# Agentic Hiring — Infrastructure for the Agent Era

> **Hiring infrastructure built for AI agents.**

Candidates do not search or apply for jobs on our website. Candidates bring their existing AI assistants (ChatGPT, Claude, Gemini). Those AI agents connect directly to company Hiring MCP Servers. Our platform is the **Company / HR Control Room**—receiving verified applications, analyzing evidence graphs, generating candidate intelligence reports, and surfacing executive interview briefing packets.

---

## 🛠️ Technology Stack

- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS (PostCSS)
- **UI Components & Icons**: Lucide React, Framer Motion
- **Design Identity**: Black/White/Off-White foundation with strong Orange Accent (`#FF6A00`), Space Grotesk editorial typography, and JetBrains Mono technical metadata.

---

## 🏛️ System Architecture & Workflow

```
CANDIDATE
    ↓
Personal AI Agent (ChatGPT / Claude / Gemini)
    ↓
Company Hiring MCP Server (mcp.stripe.com/hiring)
    ↓
Company Hiring Control Room
    ↓
Verification Agent (GitHub / Portfolio / Resume Analysis)
    ↓
Evidence-backed Candidate Intelligence Report
    ↓
Executive Interview Briefing Dossier
    ↓
Human Interviewer
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Key Routes

- `/` — Product Landing Page (10 Editorial Protocol Sections)
- `/company` — Company Overview (Role-First Management Dashboard)
- `/company/roles` — Open Roles Registry Workspace (CRUD, Status Management, MCP Exposure)
- `/company/roles/[id]` — Role Detail Workspace (Interactive Funnel, Applicants, Requirements Matrix, Telemetry)
- `/company/candidates` — Candidate Intelligence Database
- `/company/candidates/[id]` — Candidate Evidence Workspace & Interactive Evidence Graph
- `/company/candidates/[id]/brief` — Executive Interview Briefing Dossier (Printable)
- `/company/reports` — Candidate Reports & Generation Workflow Simulation
- `/company/interviews` — Interview Readiness & Briefs Manager
- `/company/mcp` — Hiring MCP Server Control Panel & Exposed Tool Inspector
- `/company/settings` — MCP Configuration & Verification Thresholds

---

## 📜 License

MIT License. Built for the AI Agent Era.
