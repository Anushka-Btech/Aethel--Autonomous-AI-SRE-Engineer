# 🚀 Aethel — Autonomous AI SRE Engineer

> **An autonomous Site Reliability Engineer that investigates incidents, reasons over a Neo4j knowledge graph, executes recovery plans, generates postmortems, and explains every decision using Gemini AI.**

---

# 📌 Problem & Domain

Modern production incidents cost organizations millions of dollars every minute.

Today, SREs spend valuable time:

- Investigating logs
- Correlating telemetry
- Understanding service dependencies
- Comparing historical incidents
- Deciding rollback strategies
- Writing postmortems

Incident response is still largely manual.

## Themes Selected

- ✅ Developer Tools & Software Infrastructure
- ✅ Infrastructure, Mobility & Smart Systems
- ✅ Trust, Identity & Security
- ✅ AI & Autonomous Systems

---

# 🎯 Objective

Aethel is an **Autonomous AI Site Reliability Engineer** designed to reduce Mean Time To Resolution (MTTR) during production outages.

Instead of merely recommending actions, Aethel autonomously:

- detects incidents
- analyzes telemetry
- traverses a live Neo4j knowledge graph
- identifies root causes
- compares historical failures
- selects the safest recovery plan
- generates a production-grade postmortem
- explains every decision using Gemini AI

### Target Users

- DevOps Engineers
- Site Reliability Engineers
- Platform Teams
- Cloud Infrastructure Teams

### Pain Point

Production incidents require engineers to manually correlate logs, metrics, deployments and infrastructure before making high-risk decisions.

### Value

Aethel reduces investigation time from minutes to seconds while providing explainable, evidence-backed autonomous incident response.

---

# 🧠 Team & Approach

## Team Name

**The Error DeCoders**

## Team Members

**Anushka Tripathi**
[FULL STACK · AI INTEGRATION · NEO4J · SYSTEM
ARCHITECTURE]

- Linkedin- https://www.linkedin.com/in/anushka-tripathi-2a6669380/
- Github- https://github.com/Anushka-Tripathi

**Anushka Chhoker**
[DEVELOPER · UX DESIGN]

- Linkedin- https://www.linkedin.com/in/anushka-c1602b5387hhoker-/
- Github- https://github.com/Anushka-Btech

**Abhinav Sarda**
[BACKEND ENGINEERING · AI INTEGRATION]

- Linkedin- 
- Github- 

---

## Our Approach

Instead of building another chatbot, we built an **AI engineer**.

Most incident tools display dashboards.

Aethel understands relationships.

Every incident is represented as a connected knowledge graph inside Neo4j AuraDB.

The AI reasons over:

- deployments
- services
- evidence
- historical incidents
- dependencies
- recovery plans

before answering.

This makes every response explainable instead of hallucinated.

---

# 🛠️ Tech Stack

## Frontend

- React 19
- TanStack Start
- TypeScript
- TailwindCSS
- Framer Motion

## Backend

- TanStack Server Functions
- AI SDK
- Google Gemini 2.5 Flash

## Database

- **Neo4j AuraDB (Primary Database)**

## APIs

- Google Gemini API
- Neo4j Driver

## Hosting

- Vercel

---

# 🏆 Sponsored Track

## ✅ Neo4j Track – AuraDB

AuraDB is **the primary database** powering Aethel.

It is **not used as storage**.

The application reasons over graph relationships in real time.

Neo4j stores:

- Incidents
- Services
- Root Causes
- Evidence
- Metrics
- Recovery Plans
- Historical Incidents
- Dependencies

Example live queries:

- Root cause traversal
- Service dependency mapping
- Similar incident search
- Evidence correlation
- Failure chain visualization

Every graph shown in the application is queried live from AuraDB using Cypher.

---

# ✨ Key Features

## 🤖 Autonomous AI SRE

Investigates production incidents using Gemini.

---

## 🌐 Live Neo4j Knowledge Graph

Traverses real graph relationships between services, deployments, failures and evidence.

---

## 📊 Service Dependency Graph

Visualizes blast radius across production systems.

---

## 🔍 Similar Incident Search

Uses graph traversal to retrieve previous production incidents with similarity scoring.

---

## 📝 AI Generated Postmortem

Automatically produces production-grade postmortems in Markdown.

---

## 📈 Root Cause Analysis

Combines telemetry, logs and graph relationships to identify failures.

---

## 💬 Ask Aethel

Interactive AI chat with full production incident context.

---

## ⚡ Digital Twin Recovery Simulation

Evaluates multiple recovery plans before selecting the safest option.

---

# 📽️ Demo & Deliverables

## Live Demo

https://aethel-sre.vercel.app/

## GitHub

https://github.com/Anushka-Btech/Aethel--Autonomous-AI-SRE-Engineer

## Demo Video

(Attach YouTube Link)

---

# ✅ Tasks & Bonus Checklist

- ✅ All mandatory social tasks completed
- ✅ Neo4j Sponsored Track
- ✅ Blog (Optional)
- ✅ Badge Sharing (Optional)

---

# 🧪 How to Run

## Requirements

- Node.js 20+
- npm
- Neo4j AuraDB
- Google Gemini API Key

---

## Clone

```bash
git clone https://github.com/Anushka-Btech/Aethel--Autonomous-AI-SRE-Engineer
```

```bash
cd Aethel--Autonomous-AI-SRE-Engineer
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
GEMINI_API_KEY=your_key

NEO4J_URI=neo4j+s://xxxx.databases.neo4j.io
NEO4J_USERNAME=xxxx
NEO4J_PASSWORD=xxxx
NEO4J_DATABASE=xxxx
```

Seed AuraDB

```bash
npm run db:seed
```

Run

```bash
npm run dev
```

Open

```
http://localhost:8080
```

---

# 🧬 Future Scope

- Multi-incident autonomous reasoning
- Kubernetes live cluster integration
- GitHub Actions remediation
- PagerDuty integration
- Slack integration
- OpenTelemetry ingestion
- Live Prometheus metrics
- Multi-cloud deployment support
- Autonomous canary analysis
- Reinforcement learning for recovery planning

---

# 📎 Resources & Credits

- Google Gemini API
- Neo4j AuraDB
- AI SDK
- React
- TanStack Start
- TailwindCSS
- Framer Motion

---

# 🏁 Final Words

Aethel began with a simple question:

> **What if an AI could act as the on-call Site Reliability Engineer instead of simply assisting one?**

During HackHazards '26 we transformed that idea into a working autonomous incident response platform.

Rather than building another chatbot, we built a system capable of understanding relationships through graphs, reasoning over production incidents, and explaining every action with evidence.

This project reflects our vision of the future of Site Reliability Engineering—where AI collaborates with humans by handling repetitive operational work while keeping every decision transparent and explainable.

Thank you for reviewing Aethel.
